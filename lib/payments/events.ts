// lib/payments/events.ts
import { prisma } from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security/logSecurityEvent";
import { logFraudSignal } from "@/lib/security/fraud";

type Provider = "paystack" | "monnify";

interface RefundEventInput {
  provider: Provider;
  reference: string;
  amount?: number; // in your internal unit (same as order.total)
  raw?: unknown;
}

interface ChargebackEventInput {
  provider: Provider;
  reference: string;
  amount?: number;
  reason?: string;
  raw?: unknown;
}

// --- Automated REFUND handling ---
export async function handleRefundEvent(input: RefundEventInput) {
  const { provider, reference, amount, raw } = input;

  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { order: true },
  });

  if (!payment || !payment.order) {
    await logSecurityEvent({
      type: "REFUND_UNKNOWN_REFERENCE",
      message: `Refund for unknown payment reference ${reference}`,
      severity: "medium",
      metadata: { provider, reference, amount, raw },
    });
    return { ok: false, reason: "unknown_payment" as const };
  }

  const order = payment.order;

  return await prisma.$transaction(async (tx) => {
    // Mark payment as refunded
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "REFUNDED",
      },
    });

    // Update order refundedAmount
    const refundAmount = amount ?? payment.amount ?? 0;

    await tx.order.update({
      where: { id: order.id },
      data: {
        refundedAmount: (order.refundedAmount ?? 0) + refundAmount,
        // Optional: if fully refunded, you may want to cancel the order
        // orderStatus: "CANCELLED",
      },
    });

    await logSecurityEvent({
      type: "PAYMENT_REFUNDED",
      message: `Payment ${reference} refunded via ${provider}`,
      severity: "medium",
      metadata: { provider, reference, amount: refundAmount, raw },
    });

    return { ok: true as const, reason: "refunded" as const };
  });
}

// --- Automated CHARGEBACK handling ---
export async function handleChargebackEvent(input: ChargebackEventInput) {
  const { provider, reference, amount, reason, raw } = input;

  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: { order: true },
  });

  if (!payment || !payment.order) {
    await logSecurityEvent({
      type: "CHARGEBACK_UNKNOWN_REFERENCE",
      message: `Chargeback for unknown payment reference ${reference}`,
      severity: "high",
      metadata: { provider, reference, amount, reason, raw },
    });
    return { ok: false, reason: "unknown_payment" as const };
  }

  const order = payment.order;

  return await prisma.$transaction(async (tx) => {
    // Mark payment as chargeback
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "CHARGEBACK",
      },
    });

    // Update refundedAmount (chargeback is effectively a refund)
    const chargebackAmount = amount ?? payment.amount ?? 0;

    await tx.order.update({
      where: { id: order.id },
      data: {
        refundedAmount: (order.refundedAmount ?? 0) + chargebackAmount,
        // Often you’ll also mark the order as cancelled or flagged:
        // orderStatus: "CANCELLED",
      },
    });

    await logFraudSignal({
      type: "PAYMENT_CHARGEBACK",
      provider,
      reference,
      metadata: { amount: chargebackAmount, reason, raw },
    });

    await logSecurityEvent({
      type: "PAYMENT_CHARGEBACK",
      message: `Chargeback on payment ${reference} via ${provider}`,
      severity: "high",
      metadata: { provider, reference, amount: chargebackAmount, reason, raw },
    });

    return { ok: true as const, reason: "chargeback" as const };
  });
}
