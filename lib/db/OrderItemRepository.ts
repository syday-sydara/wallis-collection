// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { OrderItemInput } from "@/lib/validation/types/OrderItem.types";

export const orderItemRepository = {
  async findById(id: string) {
    return prisma.orderItem.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.orderItem.findMany(args);
  },

  async create(data: OrderItemInput) {
    return prisma.orderItem.create({ data });
  },

  async update(id: string, data: Partial<OrderItemInput>) {
    return prisma.orderItem.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.orderItem.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
