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
import { sendWhatsAppAlert } from "@/lib/alerts/whatsapp";

type Provider = "paystack" | "monnify";
type Source = "webhook" | "reconciliation";

export async function processPaymentEvent(params: {
  provider: Provider;
  reference: string;
  rawPayload?: unknown;
  source: Source;
}) {
  const { provider, reference, rawPayload, source } = params;

  // --- Fetch payment + order ---
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

  // --- Idempotency: already paid ---
  if (payment.status === "SUCCESS" && order.isPaid) {
    return { ok: true, reason: "already_paid" as const };
  }

  // --- Verify with provider ---
  const verification = await verifyPayment(provider, reference, {
    rawPayload,
    source,
  });

  const signals: FraudSignal[] = [];

  // Signature invalid (if your verifyPayment exposes this)
  if ((verification as any).signatureValid === false) {
    signals.push("INVALID_SIGNATURE");
    return { ok: false, reason: "invalid_signature" as const };
  }

  // Pending
  if (verification.status === "pending") {
    return { ok: false, reason: "pending" as const };
  }

  // Provider failure
  if (verification.status === "failed") {
    signals.push("PROVIDER_REPORTED_FAILURE");
  }

  // Domain checks on success
  if (verification.status === "success") {
    const amount = (verification as any).amount;
    const currency = (verification as any).currency;

    if (typeof amount === "number" && amount !== order.total) {
      signals.push("AMOUNT_MISMATCH");
    }

    if (currency && currency !== order.currency) {
      signals.push("CURRENCY_MISMATCH");
    }

    if (order.total > 200_000) {
      signals.push("HIGH_VALUE_ORDER");
    }
  }

  // Compute fraud score
  const score = await computeFraudScore(signals, {
    orderId: order.id,
    paymentId: payment.id,
    provider,
    reference,
    source,
  });

  const severity = classifyFraudScore(score);

  // --- Transactional update ---
  return await prisma.$transaction(async (tx) => {
    const fresh = await tx.payment.findUnique({
      where: { id: payment.id },
      include: { order: true },
    });

    if (!fresh || !fresh.order) {
      return { ok: false, reason: "order_disappeared" as const };
    }

    const freshOrder = fresh.order;

    // Idempotency (post‑verification)
    if (fresh.status === "SUCCESS" && freshOrder.isPaid) {
      return { ok: true, reason: "already_paid" as const };
    }

    // Ensure order enters PENDING_PAYMENT when payment exists but order is still CREATED
    if (freshOrder.orderStatus === "CREATED") {
      await tx.order.update({
        where: { id: freshOrder.id },
        data: { orderStatus: "PENDING_PAYMENT" },
      });
    }

    // --- EXPIRED (if your verifyPayment can return this) ---
    if (verification.status === "expired") {
      await tx.payment.update({
        where: { id: fresh.id },
        data: { status: "EXPIRED" },
      });

      await tx.order.update({
        where: { id: freshOrder.id },
        data: { orderStatus: "CANCELLED" },
      });

      return { ok: false, reason: "expired" as const };
    }

    // --- PARTIAL (if supported by provider) ---
    if (verification.status === "partial") {
      await tx.payment.update({
        where: { id: fresh.id },
        data: { status: "PARTIAL" },
      });

      await tx.order.update({
        where: { id: freshOrder.id },
        data: { orderStatus: "PENDING_PAYMENT" },
      });

      return { ok: false, reason: "partial" as const };
    }

    // --- Provider says FAILED ---
    if (verification.status === "failed") {
      await tx.payment.update({
        where: { id: fresh.id },
        data: { status: "FAILED" },
      });

      await tx.order.update({
        where: { id: freshOrder.id },
        data: { orderStatus: "CANCELLED" },
      });

      return { ok: false, reason: "failed" as const, score };
    }

    // --- Provider says SUCCESS but suspicious → REVIEW ---
    const isSuspicious = severity !== "low" || signals.length > 0;

    if (verification.status === "success" && isSuspicious) {
      await tx.payment.update({
        where: { id: fresh.id },
        data: { status: "REVIEW" },
      });

      await tx.order.update({
        where: { id: freshOrder.id },
        data: { orderStatus: "REVIEW" },
      });

      await logSecurityEvent({
        type: "PAYMENT_REVIEW",
        message: `Payment ${reference} flagged for review`,
        severity,
        metadata: { provider, reference, score, signals },
      });

      if (process.env.OPS_WHATSAPP_NUMBER) {
        await sendWhatsAppAlert({
          to: process.env.OPS_WHATSAPP_NUMBER,
          template: "payment_review_required",
          variables: [freshOrder.id, reference, score.toString()],
          severity: "high",
        });
      }

      return { ok: false, reason: "review" as const, score };
    }

    // --- SUCCESS + low risk ---
    if (verification.status === "success") {
      await tx.order.update({
        where: { id: freshOrder.id },
        data: {
          isPaid: true,
          orderStatus: "CONFIRMED",
        },
      });

      await tx.payment.update({
        where: { id: fresh.id },
        data: {
          status: "SUCCESS",
          channel: (verification as any).channel,
          fee: (verification as any).fee,
        },
      });

      return { ok: true, reason: "paid" as const };
    }

    return { ok: false, reason: "unknown" as const };
  });
}
