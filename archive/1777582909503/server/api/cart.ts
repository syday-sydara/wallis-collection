// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { CartSchema } from "@/lib/validation/schemas/Cart.schema";
import { cartRepository } from "@/lib/db/CartRepository";

export const cartRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => cartRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => cartRepository.findMany(input)),

  create: publicProcedure
    .input(CartSchema)
    .mutation(({ input }) => cartRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: CartSchema.partial() }))
    .mutation(({ input }) => cartRepository.update(input.id, input.data)),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => cartRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
