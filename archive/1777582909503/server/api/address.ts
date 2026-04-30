// === AUTO-GENERATED START ===
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { AddressSchema } from "@/lib/validation/schemas/Address.schema";
import { addressRepository } from "@/lib/db/AddressRepository";

export const addressRouter = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => addressRepository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => addressRepository.findMany(input)),

  create: publicProcedure
    .input(AddressSchema)
    .mutation(({ input }) => addressRepository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: AddressSchema.partial() }))
    .mutation(({ input }) => addressRepository.update(input.id, input.data)),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => addressRepository.delete(input.id)),
});
// === AUTO-GENERATED END ===
