import { prisma } from "../prisma/client";
import { PaymentProvider, PaymentStatus } from "@prisma/client";

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

      if (payment.status === PaymentStatus.SUCCESS) {
        return payment; // idempotency guard
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

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
        },
      });

      return updated;
    });
  },

  async failPayment(paymentId: string, notes?: string) {
    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        notes,
      },
    });
  },
};