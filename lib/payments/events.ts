// lib/payments/events.ts
import { prisma } from "@/lib/prisma";
import { logSecurityEvent } from "@/lib/security/logSecurityEvent";
import { logFraudSignal } from "@/lib/security/fraud";
import { sendWhatsAppAlert } from "@/lib/alerts/whatsapp";

type Provider = "paystack" | "monnify";

interface RefundEventInput {
  provider: Provider;
  reference: string;
  amount?: number;
  raw?: unknown;
}

interface ChargebackEventInput {
  provider: Provider;
  reference: string;
  amount?: number;
  reason?: string;
  raw?: unknown;
}

const OPS_WHATSAPP = process.env.OPS_WHATSAPP_NUMBER ?? "";

// REFUND
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
    const refundAmount = amount ?? payment.amount ?? 0;

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED" },
    });

    await tx.order.update({
      where: { id: order.id },
      data: {
        refundedAmount: (order.refundedAmount ?? 0) + refundAmount,
      },
    });

    await logSecurityEvent({
      type: "PAYMENT_REFUNDED",
      message: `Payment ${reference} refunded via ${provider}`,
      severity: "medium",
      metadata: { provider, reference, refundAmount, raw },
    });

    if (order.customerPhone) {
      await sendWhatsAppAlert({
        to: order.customerPhone,
        template: "payment_refunded",
        variables: [order.id, reference, refundAmount.toString()],
        severity: "medium",
      });
    }

    if (OPS_WHATSAPP) {
      await sendWhatsAppAlert({
        to: OPS_WHATSAPP,
        template: "ops_refund_alert",
        variables: [order.id, reference, refundAmount.toString()],
        severity: "medium",
      });
    }

    return { ok: true as const, reason: "refunded" as const };
  });
}

// CHARGEBACK
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
    const chargebackAmount = amount ?? payment.amount ?? 0;

    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "CHARGEBACK" },
    });

    await tx.order.update({
      where: { id: order.id },
      data: {
        refundedAmount: (order.refundedAmount ?? 0) + chargebackAmount,
        orderStatus:
          order.orderStatus === "DELIVERED"
            ? "RETURN_REQUESTED"
            : "CANCELLED",
      },
    });

    await logFraudSignal({
      type: "PAYMENT_CHARGEBACK",
      provider,
      reference,
      metadata: { chargebackAmount, reason, raw },
    });

    await logSecurityEvent({
      type: "PAYMENT_CHARGEBACK",
      message: `Chargeback on payment ${reference} via ${provider}`,
      severity: "high",
      metadata: { provider, reference, chargebackAmount, reason, raw },
    });

    if (order.customerPhone) {
      await sendWhatsAppAlert({
        to: order.customerPhone,
        template: "payment_chargeback",
        variables: [
          order.id,
          reference,
          chargebackAmount.toString(),
          reason ?? "Chargeback",
        ],
        severity: "high",
      });
    }

    if (OPS_WHATSAPP) {
      await sendWhatsAppAlert({
        to: OPS_WHATSAPP,
        template: "ops_chargeback_alert",
        variables: [
          order.id,
          reference,
          chargebackAmount.toString(),
          reason ?? "Chargeback",
        ],
        severity: "high",
      });
    }

    return { ok: true as const, reason: "chargeback" as const };
  });
}
