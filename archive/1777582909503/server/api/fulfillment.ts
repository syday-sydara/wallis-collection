// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { FulfillmentSchema } from "@/lib/validation/schemas/Fulfillment.schema";
import { fulfillmentRepository } from "@/lib/db/FulfillmentRepository";

export const fulfillmentRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => fulfillmentRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => fulfillmentRepository.findMany(input)),

  create: publicProcedure
    .input(FulfillmentSchema)
    .mutation(({ input }) => fulfillmentRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: FulfillmentSchema.partial() }))
    .mutation(({ input }) =>
      fulfillmentRepository.update(input.id, input.data),
    ),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => fulfillmentRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
