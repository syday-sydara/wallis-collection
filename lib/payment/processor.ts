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
  rawPayload?: any; // webhook body
  source: "webhook" | "reconciliation";
}) {
  const { provider, reference, rawPayload, source } = params;

  const order = await prisma.order.findUnique({
    where: { id: reference }
  });

  if (!order) {
    await logFraudSignal({
      type: "WEBHOOK_UNKNOWN_ORDER",
      provider,
      reference
    });
    return { ok: false, reason: "unknown_order" };
  }

  // Already paid → idempotent
  if (order.paymentStatus === "PAID") {
    return { ok: true, reason: "already_paid" };
  }

  // 1. Verify payment with provider
  const verification = await verifyPayment(provider, reference);

  const signals: FraudSignal[] = [];

  if (verification.status === "failed") {
    signals.push("WEBHOOK_PROVIDER_MISMATCH");
  }

  // Amount mismatch check
  const providerAmount =
    (verification.raw as any)?.data?.amount ??
    (verification.raw as any)?.amount;

  if (
    verification.status === "success" &&
    typeof providerAmount === "number" &&
    providerAmount !== order.totalAmount
  ) {
    signals.push("AMOUNT_MISMATCH");
  }

  // High-value order
  if (order.totalAmount > 200000) {
    signals.push("HIGH_VALUE_ORDER");
  }

  // 2. Compute fraud score
  const score = computeFraudScore(signals);
  const severity = classifyFraudScore(score);

  // 3. Update order based on verification + fraud score
  if (verification.status === "success" && severity === "low") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
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

  // Fraud or mismatch → flag
  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus:
        verification.status === "success" ? "REVIEW" : "FAILED",
      fraudScore: score
    }
  });

  if (signals.length > 0) {
    await logFraudSignal({
      type: "WEBHOOK_PROVIDER_MISMATCH",
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
}
