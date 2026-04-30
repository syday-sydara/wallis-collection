// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { WhatsAppMessageLogInput } from "@/lib/validation/types/WhatsAppMessageLog.types";

export const whatsAppMessageLogRepository = {
  async findById(id: string) {
    return prisma.whatsAppMessageLog.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.whatsAppMessageLog.findMany(args);
  },

  async create(data: WhatsAppMessageLogInput) {
    return prisma.whatsAppMessageLog.create({ data });
  },

  async update(id: string, data: Partial<WhatsAppMessageLogInput>) {
    return prisma.whatsAppMessageLog.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.whatsAppMessageLog.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
