// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { AlertEventInput } from "@/lib/validation/types/AlertEvent.types";

export const alertEventRepository = {
  async findById(id: string) {
    return prisma.alertEvent.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.alertEvent.findMany(args);
  },

  async create(data: AlertEventInput) {
    return prisma.alertEvent.create({ data });
  },

  async update(id: string, data: Partial<AlertEventInput>) {
    return prisma.alertEvent.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.alertEvent.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
