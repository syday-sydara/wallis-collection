// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { SecurityEventInput } from "@/lib/validation/types/SecurityEvent.types";

export const securityEventRepository = {
  async findById(id: string) {
    return prisma.securityEvent.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.securityEvent.findMany(args);
  },

  async create(data: SecurityEventInput) {
    return prisma.securityEvent.create({ data });
  },

  async update(id: string, data: Partial<SecurityEventInput>) {
    return prisma.securityEvent.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.securityEvent.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
