// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { OrderSchema } from "@/lib/validation/schemas/Order.schema";
import { orderRepository } from "@/lib/db/OrderRepository";

export const orderRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => orderRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => orderRepository.findMany(input)),

  create: publicProcedure
    .input(OrderSchema)
    .mutation(({ input }) => orderRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: OrderSchema.partial() }))
    .mutation(({ input }) => orderRepository.update(input.id, input.data)),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => orderRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
