// lib/payments/processor.ts
import { prisma } from "@/lib/db";
import { verifyPayment } from "@/lib/payment/verification";
import { logSecurityEvent } from "@/lib/security/events";
import { logFraudSignal } from "@/lib/security/fraud";
import {
  computeFraudScore,
  classifyFraudScore,
  type FraudSignal
} from "@/lib/security/fraud-score";

export async function processPaymentEvent(params: {
  provider: "paystack" | "monnify";
  reference: string;
  rawPayload?: any;
  source: "webhook" | "reconciliation";
}) {
  const { provider, reference, rawPayload, source } = params;

  // --- Fetch order by payment reference ---
  const order = await prisma.order.findUnique({
    where: { paymentReference: reference }
  });

  if (!order) {
    await logFraudSignal({
      type: "UNKNOWN_PAYMENT_REFERENCE",
      provider,
      reference
    });
    return { ok: false, reason: "unknown_order" };
  }

  // --- Idempotency ---
  if (order.paymentStatus === "PAID") {
    return { ok: true, reason: "already_paid" };
  }

  // --- Verify with provider ---
  const verification = await verifyPayment(provider, reference);

  const signals: FraudSignal[] = [];

  if (verification.status === "error") {
    signals.push("PROVIDER_ERROR");
  }

  if (verification.status === "failed") {
    signals.push("PROVIDER_REPORTED_FAILURE");
  }

  // --- Amount mismatch ---
  const providerAmount =
    (verification.raw as any)?.data?.amount ??
    (verification.raw as any)?.amount;

  if (
    verification.status === "success" &&
    typeof providerAmount === "number" &&
    providerAmount !== order.total
  ) {
    signals.push("AMOUNT_MISMATCH");
  }

  // --- High-value order ---
  if (order.total > 200000) {
    signals.push("HIGH_VALUE_ORDER");
  }

  // --- Compute fraud score ---
  const score = computeFraudScore(signals);
  const severity = classifyFraudScore(score);

  // --- Transaction-safe update ---
  return await prisma.$transaction(async (tx) => {
    const fresh = await tx.order.findUnique({
      where: { id: order.id }
    });

    if (!fresh) {
      return { ok: false, reason: "order_disappeared" };
    }

    // Idempotency inside transaction
    if (fresh.paymentStatus === "PAID") {
      return { ok: true, reason: "already_paid" };
    }

    // --- Success path ---
    if (verification.status === "success" && severity === "low") {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          orderStatus: "PROCESSING", // valid enum
          fraudScore: score
        }
      });

      await logSecurityEvent({
        type: "PAYMENT_CONFIRMED",
        message: `Order ${order.id} confirmed via ${source}`,
        severity: "low",
        metadata: { provider, reference, score }
      });

      return { ok: true, reason: "paid" };
    }

    // --- Fraud or mismatch ---
    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus:
          verification.status === "success" ? "REVIEW" : "FAILED",
        fraudScore: score
      }
    });

    if (signals.length > 0) {
      await logFraudSignal({
        type: "PAYMENT_FLAGGED",
        provider,
        reference,
        metadata: { signals, score }
      });
    }

    await logSecurityEvent({
      type: "PAYMENT_FLAGGED",
      message: `Order ${order.id} flagged via ${source}`,
      severity,
      metadata: { provider, reference, score, signals }
    });

    return { ok: false, reason: "flagged", score };
  });
}