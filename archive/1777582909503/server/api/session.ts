// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { SessionSchema } from "@/lib/validation/schemas/Session.schema";
import { sessionRepository } from "@/lib/db/SessionRepository";

export const sessionRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => sessionRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => sessionRepository.findMany(input)),

  create: publicProcedure
    .input(SessionSchema)
    .mutation(({ input }) => sessionRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: SessionSchema.partial() }))
    .mutation(({ input }) => sessionRepository.update(input.id, input.data)),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => sessionRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
