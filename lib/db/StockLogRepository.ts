// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { StockLogInput } from "@/lib/validation/types/StockLog.types";

export const stockLogRepository = {
  async findById(id: string) {
    return prisma.stockLog.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.stockLog.findMany(args);
  },

  async create(data: StockLogInput) {
    return prisma.stockLog.create({ data });
  },

  async update(id: string, data: Partial<StockLogInput>) {
    return prisma.stockLog.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.stockLog.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
