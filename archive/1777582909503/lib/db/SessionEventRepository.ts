// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { SessionEventInput } from "@/lib/validation/types/SessionEvent.types";

export const sessionEventRepository = {
  async findById(id: string) {
    return prisma.sessionEvent.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.sessionEvent.findMany(args);
  },

  async create(data: SessionEventInput) {
    return prisma.sessionEvent.create({ data });
  },

  async update(id: string, data: Partial<SessionEventInput>) {
    return prisma.sessionEvent.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.sessionEvent.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
