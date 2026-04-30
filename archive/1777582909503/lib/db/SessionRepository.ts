// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { SessionInput } from "@/lib/validation/types/Session.types";

export const sessionRepository = {
  async findById(id: string) {
    return prisma.session.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.session.findMany(args);
  },

  async create(data: SessionInput) {
    return prisma.session.create({ data });
  },

  async update(id: string, data: Partial<SessionInput>) {
    return prisma.session.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.session.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
