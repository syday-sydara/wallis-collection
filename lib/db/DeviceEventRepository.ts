// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { DeviceEventInput } from "@/lib/validation/types/DeviceEvent.types";

export const deviceEventRepository = {
  async findById(id: string) {
    return prisma.deviceEvent.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.deviceEvent.findMany(args);
  },

  async create(data: DeviceEventInput) {
    return prisma.deviceEvent.create({ data });
  },

  async update(id: string, data: Partial<DeviceEventInput>) {
    return prisma.deviceEvent.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.deviceEvent.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
