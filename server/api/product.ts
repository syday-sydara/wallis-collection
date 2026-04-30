// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { ProductSchema } from "@/lib/validation/schemas/Product.schema";
import { productRepository } from "@/lib/db/ProductRepository";

export const productRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => productRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => productRepository.findMany(input)),

  create: publicProcedure
    .input(ProductSchema)
    .mutation(({ input }) => productRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: ProductSchema.partial() }))
    .mutation(({ input }) => productRepository.update(input.id, input.data)),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => productRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
