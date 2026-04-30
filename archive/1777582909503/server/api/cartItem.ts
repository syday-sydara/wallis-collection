// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { CartItemSchema } from "@/lib/validation/schemas/CartItem.schema";
import { cartItemRepository } from "@/lib/db/CartItemRepository";

export const cartItemRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => cartItemRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => cartItemRepository.findMany(input)),

  create: publicProcedure
    .input(CartItemSchema)
    .mutation(({ input }) => cartItemRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: CartItemSchema.partial() }))
    .mutation(({ input }) => cartItemRepository.update(input.id, input.data)),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => cartItemRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
