// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { PaymentSchema } from "@/lib/validation/schemas/Payment.schema";
import { paymentRepository } from "@/lib/db/PaymentRepository";

export const paymentRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => paymentRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => paymentRepository.findMany(input)),

  create: publicProcedure
    .input(PaymentSchema)
    .mutation(({ input }) => paymentRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: PaymentSchema.partial() }))
    .mutation(({ input }) => paymentRepository.update(input.id, input.data)),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => paymentRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
