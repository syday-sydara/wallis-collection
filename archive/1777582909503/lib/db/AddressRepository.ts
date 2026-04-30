// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { AddressInput } from "@/lib/validation/types/Address.types";

export const addressRepository = {
  async findById(id: string) {
    return prisma.address.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.address.findMany(args);
  },

  async create(data: AddressInput) {
    return prisma.address.create({ data });
  },

  async update(id: string, data: Partial<AddressInput>) {
    return prisma.address.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.address.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
