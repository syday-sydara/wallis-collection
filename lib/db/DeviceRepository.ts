// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { DeviceInput } from "@/lib/validation/types/Device.types";

export const deviceRepository = {
  async findById(id: string) {
    return prisma.device.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.device.findMany(args);
  },

  async create(data: DeviceInput) {
    return prisma.device.create({ data });
  },

  async update(id: string, data: Partial<DeviceInput>) {
    return prisma.device.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.device.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
