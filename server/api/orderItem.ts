// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { OrderItemSchema } from "@/lib/validation/schemas/OrderItem.schema";
import { orderItemRepository } from "@/lib/db/OrderItemRepository";

export const orderItemRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => orderItemRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => orderItemRepository.findMany(input)),

  create: publicProcedure
    .input(OrderItemSchema)
    .mutation(({ input }) => orderItemRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: OrderItemSchema.partial() }))
    .mutation(({ input }) => orderItemRepository.update(input.id, input.data)),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => orderItemRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
