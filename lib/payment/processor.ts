// lib/payments/processor.ts
import { prisma } from "@/lib/db";
import { verifyPayment } from "@/lib/payments/verification";

// Security logging
import { logSecurityEvent } from "@/lib/security/logSecurityEvent";
import { logFraudSignal } from "@/lib/security/fraud";

// Fraud scoring
import { computeFraudScore, classifyFraudScore, type FraudSignal } from "@/lib/security/computeFraudScore";

export async function processPaymentEvent(params: {
  provider: "paystack" | "monnify";
  reference: string;
  rawPayload?: any;
  source: "webhook" | "reconciliation";
}) {
  const { provider, reference, rawPayload, source } = params;

  // --- Fetch payment by reference ---
  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { order: true },
  });

  if (!payment || !payment.order) {
    await logFraudSignal({
      type: "WEBHOOK_UNKNOWN_ORDER",
      provider,
      reference,
    });
    return { ok: false, reason: "unknown_order" };
  }

  const order = payment.order;

  // --- Idempotency ---
  if (payment.status === "SUCCESS" || order.isPaid) {
    return { ok: true, reason: "already_paid" };
  }

  // --- Verify payment with provider ---
  const verification = await verifyPayment(provider, reference);

  if (verification.status === "pending") {
    return { ok: false, reason: "pending" };
  }

  const signals: FraudSignal[] = [];

  if (verification.status === "error") {
    signals.push("PROVIDER_ERROR");
  }

  if (verification.status === "failed") {
    signals.push("PROVIDER_REPORTED_FAILURE");
  }

  // --- Amount mismatch ---
  const providerAmount =
    (verification as any).amount ?? (verification.raw as any)?.data?.amount;

  if (
    verification.status === "success" &&
    typeof providerAmount === "number" &&
    providerAmount !== order.total
  ) {
    signals.push("AMOUNT_MISMATCH");
  }

  // --- High-value order ---
  if (order.total > 200_000) {
    signals.push("HIGH_VALUE_ORDER");
  }

  // --- Compute fraud score ---
  const score = await computeFraudScore(signals, { orderId: order.id });
  const severity = classifyFraudScore(score);

  // --- Transaction-safe update ---
  return await prisma.$transaction(async (tx) => {
    const freshPayment = await tx.payment.findUnique({
      where: { id: payment.id },
      include: { order: true },
    });

    if (!freshPayment || !freshPayment.order) {
      return { ok: false, reason: "order_disappeared" };
    }

    const freshOrder = freshPayment.order;

    if (freshPayment.status === "SUCCESS" || freshOrder.isPaid) {
      return { ok: true, reason: "already_paid" };
    }

    // --- Success path ---
    if (verification.status === "success" && severity === "low") {
      await tx.order.update({
        where: { id: order.id },
        data: {
          isPaid: true,
          orderStatus: "CONFIRMED",
        },
      });

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS" },
      });

      await logSecurityEvent({
        type: "PAYMENT_CONFIRMED",
        message: `Order ${order.id} confirmed via ${source}`,
        severity: "low",
        metadata: { provider, reference, score },
      });

      return { ok: true, reason: "paid" };
    }

    // --- Fraud or mismatch ---
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: verification.status === "success" ? "SUCCESS" : "FAILED",
      },
    });

    if (signals.length > 0) {
      await logFraudSignal({
        type: "WEBHOOK_DUPLICATE_EXCESSIVE",
        provider,
        reference,
        metadata: { signals, score },
      });
    }

    await logSecurityEvent({
      type: "PAYMENT_FLAGGED",
      message: `Order ${order.id} flagged via ${source}`,
      severity,
      metadata: { provider, reference, score, signals },
    });

    return { ok: false, reason: "flagged", score };
  });
}