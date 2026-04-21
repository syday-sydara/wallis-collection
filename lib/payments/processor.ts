// lib/payments/processor.ts
import { prisma } from "@/lib/prisma";
import { verifyPayment } from "@/lib/payments/verification";

import { logSecurityEvent } from "@/lib/security/logSecurityEvent";
import { logFraudSignal } from "@/lib/security/fraud";

import {
  computeFraudScore,
  classifyFraudScore,
  type FraudSignal,
} from "@/lib/security/computeFraudScore";

type Provider = "paystack" | "monnify";
type Source = "webhook" | "reconciliation";

export async function processPaymentEvent(params: {
  provider: Provider;
  reference: string;
  rawPayload?: unknown;
  source: Source;
}) {
  const { provider, reference, rawPayload, source } = params;

  // --- 1. Fetch payment + order ---
  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { order: true },
  });

  if (!payment || !payment.order) {
    await logFraudSignal({
      type: "WEBHOOK_UNKNOWN_ORDER",
      provider,
      reference,
      metadata: { source },
    });

    await logSecurityEvent({
      type: "PAYMENT_UNKNOWN_REFERENCE",
      message: `Payment reference ${reference} not linked to any order`,
      severity: "medium",
      metadata: { provider, reference, source },
    });

    return { ok: false, reason: "unknown_order" as const };
  }

  const order = payment.order;

  // --- 2. Idempotency (pre‑verification) ---
  if (payment.status === "SUCCESS" && order.isPaid) {
    if (source === "webhook") {
      await logSecurityEvent({
        type: "WEBHOOK_DUPLICATE",
        message: `Duplicate webhook for already paid order ${order.id}`,
        severity: "low",
        metadata: { provider, reference, source },
      });
    }

    return { ok: true, reason: "already_paid" as const };
  }

  // --- 3. Verify payment with provider (include raw payload) ---
  const verification = await verifyPayment(provider, reference, {
    rawPayload,
    source,
  });

  const signals: FraudSignal[] = [];

  // Signature / integrity issues
  if ((verification as any).signatureValid === false) {
    signals.push("INVALID_SIGNATURE");

    await logSecurityEvent({
      type: "PAYMENT_INVALID_SIGNATURE",
      message: `Invalid signature for ${provider} payment ${reference}`,
      severity: "critical",
      metadata: { provider, reference, source },
    });

    await logFraudSignal({
      type: "INVALID_SIGNATURE",
      provider,
      reference,
      metadata: { source },
    });

    return { ok: false, reason: "invalid_signature" as const };
  }

  // Pending – nothing to do yet
  if (verification.status === "pending") {
    await logSecurityEvent({
      type: "PAYMENT_PENDING",
      message: `Payment ${reference} still pending via ${provider}`,
      severity: "low",
      metadata: { provider, reference, source },
    });

    return { ok: false, reason: "pending" as const };
  }

  // Provider‑level errors
  if (verification.status === "error") {
    signals.push("PROVIDER_ERROR");

    await logSecurityEvent({
      type: "PAYMENT_PROVIDER_ERROR",
      message: `Provider error for ${provider} payment ${reference}`,
      severity: "medium",
      metadata: { provider, reference, source },
    });
  }

  // Provider explicitly reports failure
  if (verification.status === "failed") {
    signals.push("PROVIDER_REPORTED_FAILURE");
  }

  // --- 4. Domain checks (only meaningful if provider says success) ---
  if (verification.status === "success") {
    const providerAmount = (verification as any).amount;
    const providerCurrency = (verification as any).currency;

    if (
      typeof providerAmount === "number" &&
      providerAmount !== order.total
    ) {
      signals.push("AMOUNT_MISMATCH");
    }

    if (
      providerCurrency &&
      providerCurrency !== order.currency
    ) {
      signals.push("CURRENCY_MISMATCH");
    }

    if (order.total > 200_000) {
      signals.push("HIGH_VALUE_ORDER");
    }
  }

  // --- 5. Compute fraud score + severity ---
  const score = await computeFraudScore(signals, {
    orderId: order.id,
    paymentId: payment.id,
    provider,
    reference,
    source,
  });

  const severity = classifyFraudScore(score);

  // --- 6. Transaction‑safe update ---
  return await prisma.$transaction(async (tx) => {
    const freshPayment = await tx.payment.findUnique({
      where: { id: payment.id },
      include: { order: true },
    });

    if (!freshPayment || !freshPayment.order) {
      await logSecurityEvent({
        type: "PAYMENT_ORDER_DISAPPEARED",
        message: `Order disappeared during transaction for payment ${payment.id}`,
        severity: "high",
        metadata: { provider, reference, source },
      });

      return { ok: false, reason: "order_disappeared" as const };
    }

    const freshOrder = freshPayment.order;

    // Idempotency (post‑verification)
    if (freshPayment.status === "SUCCESS" && freshOrder.isPaid) {
      if (source === "webhook") {
        await logSecurityEvent({
          type: "WEBHOOK_DUPLICATE",
          message: `Duplicate webhook (post‑tx) for order ${freshOrder.id}`,
          severity: "low",
          metadata: { provider, reference, source },
        });
      }

      return { ok: true, reason: "already_paid" as const };
    }

    // --- 6a. Non‑success verification: mark FAILED, log, exit ---
    if (verification.status !== "success") {
      await tx.payment.update({
        where: { id: freshPayment.id },
        data: {
          status: "FAILED",
        },
      });

      if (signals.length > 0) {
        await logFraudSignal({
          type: "PAYMENT_FAILURE",
          provider,
          reference,
          metadata: { signals, score },
        });
      }

      await logSecurityEvent({
        type: "PAYMENT_FAILED",
        message: `Payment ${reference} failed via ${provider}`,
        severity,
        metadata: { provider, reference, score, signals, source },
      });

      return { ok: false, reason: "failed" as const, score };
    }

    // --- 6b. Success + low risk: mark paid + success ---
    const isLowRisk = severity === "low" && signals.length === 0;

    if (isLowRisk) {
      await tx.order.update({
        where: { id: freshOrder.id },
        data: {
          isPaid: true,
          orderStatus: "CONFIRMED",
        },
      });

      await tx.payment.update({
        where: { id: freshPayment.id },
        data: {
          status: "SUCCESS",
          channel: (verification as any).channel,
          fee: (verification as any).fee,
          // Optional: map providerTransactionId, paidAt if you store them
        },
      });

      await logSecurityEvent({
        type: "PAYMENT_CONFIRMED",
        message: `Order ${freshOrder.id} confirmed via ${source}`,
        severity: "low",
        metadata: { provider, reference, score, source },
      });

      return { ok: true, reason: "paid" as const };
    }

    // --- 6c. Success but suspicious: DO NOT mark order paid ---
    await tx.payment.update({
      where: { id: freshPayment.id },
      data: {
        status: "FAILED", // or keep PENDING if you want manual review
      },
    });

    if (signals.length > 0) {
      await logFraudSignal({
        type: "PAYMENT_SUSPICIOUS",
        provider,
        reference,
        metadata: { signals, score },
      });
    }

    await logSecurityEvent({
      type: "PAYMENT_FLAGGED",
      message: `Order ${freshOrder.id} flagged via ${source}`,
      severity,
      metadata: { provider, reference, score, signals, source },
    });

    return { ok: false, reason: "flagged" as const, score };
  });
}
