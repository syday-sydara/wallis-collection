// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { PaymentInput } from "@/lib/validation/types/Payment.types";

export const paymentRepository = {
  async findById(id: string) {
    return prisma.payment.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.payment.findMany(args);
  },

  async create(data: PaymentInput) {
    return prisma.payment.create({ data });
  },

  async update(id: string, data: Partial<PaymentInput>) {
    return prisma.payment.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.payment.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
