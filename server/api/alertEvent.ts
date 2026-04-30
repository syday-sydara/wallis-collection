// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { AlertEventSchema } from "@/lib/validation/schemas/AlertEvent.schema";
import { alertEventRepository } from "@/lib/db/AlertEventRepository";

export const alertEventRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => alertEventRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => alertEventRepository.findMany(input)),

  create: publicProcedure
    .input(AlertEventSchema)
    .mutation(({ input }) => alertEventRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: AlertEventSchema.partial() }))
    .mutation(({ input }) => alertEventRepository.update(input.id, input.data)),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => alertEventRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
