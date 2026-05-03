import { prisma } from "../lib/prisma/prisma";
import { PaymentProvider, PaymentStatus } from "@prisma/client";
import { PaymentProducer } from "../producers/payment.producer";

export const PaymentService = {
  async createBankTransfer(orderId: string, amount: number, paidByName?: string) {
    return prisma.payment.create({
      data: {
        orderId,
        provider: PaymentProvider.BANK_TRANSFER,
        amount,
        paidByName,
        status: PaymentStatus.AWAITING_CONFIRMATION,
      },
    });
  },

  async createCOD(orderId: string, amount: number) {
    return prisma.payment.create({
      data: {
        orderId,
        provider: PaymentProvider.CASH_ON_DELIVERY,
        amount,
        status: PaymentStatus.PENDING,
      },
    });
  },

  async confirmPayment(paymentId: string, adminId?: string) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) throw new Error("Payment not found");

      // idempotency
      if (payment.status === PaymentStatus.SUCCESS) {
        return payment;
      }

      const now = new Date();

      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.SUCCESS,
          paidAt: now,
          verifiedBy: adminId,
          verifiedAt: adminId ? now : undefined,
        },
      });

      // DO NOT update order here
      // Instead, emit event for workers to handle
      setImmediate(() => {
        PaymentProducer.emitPaymentSuccess({
          paymentId,
          orderId: payment.orderId,
          amount: payment.amount,
        });
      });

      return updated;
    });
  },

  async failPayment(paymentId: string, notes?: string) {
    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        notes,
      },
    });

    // emit event
    setImmediate(() => {
      PaymentProducer.emitPaymentFailed({
        paymentId,
        orderId: updated.orderId,
      });
    });

    return updated;
  },
};
