// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { UserInput } from "@/lib/validation/types/User.types";

export const userRepository = {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.user.findMany(args);
  },

  async create(data: UserInput) {
    return prisma.user.create({ data });
  },

  async update(id: string, data: Partial<UserInput>) {
    return prisma.user.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
