// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { ProductVariantInput } from "@/lib/validation/types/ProductVariant.types";

export const productVariantRepository = {
  async findById(id: string) {
    return prisma.productVariant.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.productVariant.findMany(args);
  },

  async create(data: ProductVariantInput) {
    return prisma.productVariant.create({ data });
  },

  async update(id: string, data: Partial<ProductVariantInput>) {
    return prisma.productVariant.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.productVariant.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
