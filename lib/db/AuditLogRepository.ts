// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { AuditLogInput } from "@/lib/validation/types/AuditLog.types";

export const auditLogRepository = {
  async findById(id: string) {
    return prisma.auditLog.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.auditLog.findMany(args);
  },

  async create(data: AuditLogInput) {
    return prisma.auditLog.create({ data });
  },

  async update(id: string, data: Partial<AuditLogInput>) {
    return prisma.auditLog.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.auditLog.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
