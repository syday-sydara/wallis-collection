// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { ProductImageInput } from "@/lib/validation/types/ProductImage.types";

export const productImageRepository = {
  async findById(id: string) {
    return prisma.productImage.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.productImage.findMany(args);
  },

  async create(data: ProductImageInput) {
    return prisma.productImage.create({ data });
  },

  async update(id: string, data: Partial<ProductImageInput>) {
    return prisma.productImage.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.productImage.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
