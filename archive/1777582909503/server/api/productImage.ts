// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { ProductImageSchema } from "@/lib/validation/schemas/ProductImage.schema";
import { productImageRepository } from "@/lib/db/ProductImageRepository";

export const productImageRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => productImageRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => productImageRepository.findMany(input)),

  create: publicProcedure
    .input(ProductImageSchema)
    .mutation(({ input }) => productImageRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: ProductImageSchema.partial() }))
    .mutation(({ input }) =>
      productImageRepository.update(input.id, input.data),
    ),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => productImageRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
