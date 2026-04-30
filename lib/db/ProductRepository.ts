// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { ProductInput } from "@/lib/validation/types/Product.types";

export const productRepository = {
  async findById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.product.findMany(args);
  },

  async create(data: ProductInput) {
    return prisma.product.create({ data });
  },

  async update(id: string, data: Partial<ProductInput>) {
    return prisma.product.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
