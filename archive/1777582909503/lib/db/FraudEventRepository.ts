// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { FraudEventInput } from "@/lib/validation/types/FraudEvent.types";

export const fraudEventRepository = {
  async findById(id: string) {
    return prisma.fraudEvent.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.fraudEvent.findMany(args);
  },

  async create(data: FraudEventInput) {
    return prisma.fraudEvent.create({ data });
  },

  async update(id: string, data: Partial<FraudEventInput>) {
    return prisma.fraudEvent.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.fraudEvent.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
