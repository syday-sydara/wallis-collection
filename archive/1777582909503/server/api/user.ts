// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { UserSchema } from "@/lib/validation/schemas/User.schema";
import { userRepository } from "@/lib/db/UserRepository";

export const userRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => userRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => userRepository.findMany(input)),

  create: publicProcedure
    .input(UserSchema)
    .mutation(({ input }) => userRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: UserSchema.partial() }))
    .mutation(({ input }) => userRepository.update(input.id, input.data)),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => userRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
