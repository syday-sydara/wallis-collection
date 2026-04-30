import { z } from "zod";

export const alertEventSchema = z.object({
  id: z.string().optional(),

  event: z.string(),
  userId: z.string().nullable().optional(),
  ip: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  metadata: z.any().optional(),
});
