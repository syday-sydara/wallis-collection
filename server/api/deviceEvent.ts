// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { DeviceEventSchema } from "@/lib/validation/schemas/DeviceEvent.schema";
import { deviceEventRepository } from "@/lib/db/DeviceEventRepository";

export const deviceEventRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => deviceEventRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => deviceEventRepository.findMany(input)),

  create: publicProcedure
    .input(DeviceEventSchema)
    .mutation(({ input }) => deviceEventRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: DeviceEventSchema.partial() }))
    .mutation(({ input }) =>
      deviceEventRepository.update(input.id, input.data),
    ),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => deviceEventRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
