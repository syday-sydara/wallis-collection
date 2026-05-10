// services/payment.service.ts
import { prisma } from "@/lib/prisma";
import { PaymentProvider, PaymentStatus } from "@prisma/client";
import { PaymentProducer } from "@/producers/payment.producer";
import { Correlation } from "@/lib/correlation";
import { logger } from "@/lib/logger";

export const PaymentService = {
  /**
   * Create a payment record with a specific provider + initial status.
   * Shared internal helper to remove duplication.
   */
  async createPayment(
    orderId: string,
    amount: number,
    provider: PaymentProvider,
    status: PaymentStatus,
    extra: Record<string, any> = {}
  ) {
    return prisma.payment.create({
      data: {
        orderId,
        provider,
        amount,
        status,
        ...extra,
      },
    });
  },

  /**
   * BANK TRANSFER
   */
  async createBankTransfer(orderId: string, amount: number, paidByName?: string) {
    return this.createPayment(
      orderId,
      amount,
      PaymentProvider.BANK_TRANSFER,
      PaymentStatus.AWAITING_CONFIRMATION,
      { paidByName: paidByName ?? null }
    );
  },

  /**
   * CASH ON DELIVERY
   */
  async createCOD(orderId: string, amount: number) {
    return this.createPayment(
      orderId,
      amount,
      PaymentProvider.CASH_ON_DELIVERY,
      PaymentStatus.PENDING
    );
  },

  /**
   * Confirm payment (idempotent).
   */
  async confirmPayment(paymentId: string, adminId?: string) {
    const ctx = Correlation.get();

    const updated = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: paymentId } });
      if (!payment) throw new Error("Payment not found");

      // Idempotency
      if (payment.status === PaymentStatus.SUCCESS) return payment;

      const now = new Date();

      return tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.SUCCESS,
          paidAt: now,
          verifiedBy: adminId ?? null,
          verifiedAt: adminId ? now : null,
        },
      });
    });

    // Emit AFTER commit
    PaymentProducer.success(updated.id, updated.orderId);

    logger.info("[PAYMENT] Payment confirmed", {
      ...ctx,
      paymentId: updated.id,
      orderId: updated.orderId,
    });

    return updated;
  },

  /**
   * Fail payment (idempotent).
   */
  async failPayment(paymentId: string, notes?: string) {
    const ctx = Correlation.get();

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        notes: notes ?? null,
      },
    });

    PaymentProducer.failed(updated.id, updated.orderId, notes);

    logger.warn("[PAYMENT] Payment failed", {
      ...ctx,
      paymentId: updated.id,
      orderId: updated.orderId,
    });

    return updated;
  },
};
