// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { ProductVariantSchema } from "@/lib/validation/schemas/ProductVariant.schema";
import { productVariantRepository } from "@/lib/db/ProductVariantRepository";

export const productVariantRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => productVariantRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => productVariantRepository.findMany(input)),

  create: publicProcedure
    .input(ProductVariantSchema)
    .mutation(({ input }) => productVariantRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: ProductVariantSchema.partial() }))
    .mutation(({ input }) =>
      productVariantRepository.update(input.id, input.data),
    ),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => productVariantRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
