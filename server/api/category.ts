// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { CategorySchema } from "@/lib/validation/schemas/Category.schema";
import { categoryRepository } from "@/lib/db/CategoryRepository";

export const categoryRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => categoryRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => categoryRepository.findMany(input)),

  create: publicProcedure
    .input(CategorySchema)
    .mutation(({ input }) => categoryRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: CategorySchema.partial() }))
    .mutation(({ input }) => categoryRepository.update(input.id, input.data)),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => categoryRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
