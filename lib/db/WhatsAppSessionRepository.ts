// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { WhatsAppSessionInput } from "@/lib/validation/types/WhatsAppSession.types";

export const whatsAppSessionRepository = {
  async findById(id: string) {
    return prisma.whatsAppSession.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.whatsAppSession.findMany(args);
  },

  async create(data: WhatsAppSessionInput) {
    return prisma.whatsAppSession.create({ data });
  },

  async update(id: string, data: Partial<WhatsAppSessionInput>) {
    return prisma.whatsAppSession.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.whatsAppSession.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
