// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { ProductInsightsInput } from "@/lib/validation/types/ProductInsights.types";

export const productInsightsRepository = {
  async findById(id: string) {
    return prisma.productInsights.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.productInsights.findMany(args);
  },

  async create(data: ProductInsightsInput) {
    return prisma.productInsights.create({ data });
  },

  async update(id: string, data: Partial<ProductInsightsInput>) {
    return prisma.productInsights.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.productInsights.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
