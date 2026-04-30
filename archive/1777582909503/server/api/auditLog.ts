// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { AuditLogSchema } from "@/lib/validation/schemas/AuditLog.schema";
import { auditLogRepository } from "@/lib/db/AuditLogRepository";

export const auditLogRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => auditLogRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => auditLogRepository.findMany(input)),

  create: publicProcedure
    .input(AuditLogSchema)
    .mutation(({ input }) => auditLogRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: AuditLogSchema.partial() }))
    .mutation(({ input }) => auditLogRepository.update(input.id, input.data)),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => auditLogRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
