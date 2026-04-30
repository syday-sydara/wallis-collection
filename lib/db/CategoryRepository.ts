// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { CategoryInput } from "@/lib/validation/types/Category.types";

export const categoryRepository = {
  async findById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.category.findMany(args);
  },

  async create(data: CategoryInput) {
    return prisma.category.create({ data });
  },

  async update(id: string, data: Partial<CategoryInput>) {
    return prisma.category.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.category.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
