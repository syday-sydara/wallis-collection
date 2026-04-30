// === AUTO-GENERATED START ===
import { prisma } from "@/lib/db/client";
import type { FulfillmentInput } from "@/lib/validation/types/Fulfillment.types";

export const fulfillmentRepository = {
  async findById(id: string) {
    return prisma.fulfillment.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.fulfillment.findMany(args);
  },

  async create(data: FulfillmentInput) {
    return prisma.fulfillment.create({ data });
  },

  async update(id: string, data: Partial<FulfillmentInput>) {
    return prisma.fulfillment.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.fulfillment.delete({ where: { id } });
  },
};
// === AUTO-GENERATED END ===
