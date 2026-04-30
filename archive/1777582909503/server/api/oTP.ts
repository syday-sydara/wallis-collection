// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { OTPSchema } from "@/lib/validation/schemas/OTP.schema";
import { oTPRepository } from "@/lib/db/OTPRepository";

export const oTPRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => oTPRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => oTPRepository.findMany(input)),

  create: publicProcedure
    .input(OTPSchema)
    .mutation(({ input }) => oTPRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: OTPSchema.partial() }))
    .mutation(({ input }) => oTPRepository.update(input.id, input.data)),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => oTPRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
