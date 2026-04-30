// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { OTPInput } from "@/lib/validation/types/OTP.types";

export const oTPRepository = {
  async findById(id: string) {
    return prisma.oTP.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.oTP.findMany(args);
  },

  async create(data: OTPInput) {
    return prisma.oTP.create({ data });
  },

  async update(id: string, data: Partial<OTPInput>) {
    return prisma.oTP.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.oTP.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
