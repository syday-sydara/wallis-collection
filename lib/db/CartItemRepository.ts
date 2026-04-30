// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { CartItemInput } from "@/lib/validation/types/CartItem.types";

export const cartItemRepository = {
  async findById(id: string) {
    return prisma.cartItem.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.cartItem.findMany(args);
  },

  async create(data: CartItemInput) {
    return prisma.cartItem.create({ data });
  },

  async update(id: string, data: Partial<CartItemInput>) {
    return prisma.cartItem.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.cartItem.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
