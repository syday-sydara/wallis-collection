// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { SessionEventSchema } from "@/lib/validation/schemas/SessionEvent.schema";
import { sessionEventRepository } from "@/lib/db/SessionEventRepository";

export const sessionEventRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => sessionEventRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => sessionEventRepository.findMany(input)),

  create: publicProcedure
    .input(SessionEventSchema)
    .mutation(({ input }) => sessionEventRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: SessionEventSchema.partial() }))
    .mutation(({ input }) =>
      sessionEventRepository.update(input.id, input.data),
    ),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => sessionEventRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
