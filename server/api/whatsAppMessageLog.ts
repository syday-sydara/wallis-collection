// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { WhatsAppMessageLogSchema } from "@/lib/validation/schemas/WhatsAppMessageLog.schema";
import { whatsAppMessageLogRepository } from "@/lib/db/WhatsAppMessageLogRepository";

export const whatsAppMessageLogRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => whatsAppMessageLogRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => whatsAppMessageLogRepository.findMany(input)),

  create: publicProcedure
    .input(WhatsAppMessageLogSchema)
    .mutation(({ input }) => whatsAppMessageLogRepository.create(input)),

  update: publicProcedure
    .input(
      z.object({ id: z.string(), data: WhatsAppMessageLogSchema.partial() }),
    )
    .mutation(({ input }) =>
      whatsAppMessageLogRepository.update(input.id, input.data),
    ),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => whatsAppMessageLogRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
