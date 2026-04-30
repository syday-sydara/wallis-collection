// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { DeviceSchema } from "@/lib/validation/schemas/Device.schema";
import { deviceRepository } from "@/lib/db/DeviceRepository";

export const deviceRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => deviceRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => deviceRepository.findMany(input)),

  create: publicProcedure
    .input(DeviceSchema)
    .mutation(({ input }) => deviceRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: DeviceSchema.partial() }))
    .mutation(({ input }) => deviceRepository.update(input.id, input.data)),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => deviceRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
