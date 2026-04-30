import { z } from "zod";

export const sessionEventSchema = z.object({
  id: z.string().optional(),

  sessionId: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  ip: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  metadata: z.any().optional(),
});
