// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { StockLogSchema } from "@/lib/validation/schemas/StockLog.schema";
import { stockLogRepository } from "@/lib/db/StockLogRepository";

export const stockLogRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => stockLogRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => stockLogRepository.findMany(input)),

  create: publicProcedure
    .input(StockLogSchema)
    .mutation(({ input }) => stockLogRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: StockLogSchema.partial() }))
    .mutation(({ input }) => stockLogRepository.update(input.id, input.data)),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => stockLogRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
