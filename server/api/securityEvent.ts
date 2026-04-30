// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { SecurityEventSchema } from "@/lib/validation/schemas/SecurityEvent.schema";
import { securityEventRepository } from "@/lib/db/SecurityEventRepository";

export const securityEventRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => securityEventRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => securityEventRepository.findMany(input)),

  create: publicProcedure
    .input(SecurityEventSchema)
    .mutation(({ input }) => securityEventRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: SecurityEventSchema.partial() }))
    .mutation(({ input }) =>
      securityEventRepository.update(input.id, input.data),
    ),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => securityEventRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
