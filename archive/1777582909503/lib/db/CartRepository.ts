// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { CartInput } from "@/lib/validation/types/Cart.types";

export const cartRepository = {
  async findById(id: string) {
    return prisma.cart.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.cart.findMany(args);
  },

  async create(data: CartInput) {
    return prisma.cart.create({ data });
  },

  async update(id: string, data: Partial<CartInput>) {
    return prisma.cart.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.cart.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
