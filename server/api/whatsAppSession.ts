// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { WhatsAppSessionSchema } from "@/lib/validation/schemas/WhatsAppSession.schema";
import { whatsAppSessionRepository } from "@/lib/db/WhatsAppSessionRepository";

export const whatsAppSessionRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => whatsAppSessionRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => whatsAppSessionRepository.findMany(input)),

  create: publicProcedure
    .input(WhatsAppSessionSchema)
    .mutation(({ input }) => whatsAppSessionRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: WhatsAppSessionSchema.partial() }))
    .mutation(({ input }) =>
      whatsAppSessionRepository.update(input.id, input.data),
    ),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => whatsAppSessionRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
