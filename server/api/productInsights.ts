// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { ProductInsightsSchema } from "@/lib/validation/schemas/ProductInsights.schema";
import { productInsightsRepository } from "@/lib/db/ProductInsightsRepository";

export const productInsightsRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => productInsightsRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => productInsightsRepository.findMany(input)),

  create: publicProcedure
    .input(ProductInsightsSchema)
    .mutation(({ input }) => productInsightsRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: ProductInsightsSchema.partial() }))
    .mutation(({ input }) =>
      productInsightsRepository.update(input.id, input.data),
    ),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => productInsightsRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
