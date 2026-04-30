// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { OrderInput } from "@/lib/validation/types/Order.types";

export const orderRepository = {
  async findById(id: string) {
    return prisma.order.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.order.findMany(args);
  },

  async create(data: OrderInput) {
    return prisma.order.create({ data });
  },

  async update(id: string, data: Partial<OrderInput>) {
    return prisma.order.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.order.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
