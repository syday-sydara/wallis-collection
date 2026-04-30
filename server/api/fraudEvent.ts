// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { FraudEventSchema } from "@/lib/validation/schemas/FraudEvent.schema";
import { fraudEventRepository } from "@/lib/db/FraudEventRepository";

export const fraudEventRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => fraudEventRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => fraudEventRepository.findMany(input)),

  create: publicProcedure
    .input(FraudEventSchema)
    .mutation(({ input }) => fraudEventRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: FraudEventSchema.partial() }))
    .mutation(({ input }) => fraudEventRepository.update(input.id, input.data)),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => fraudEventRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
