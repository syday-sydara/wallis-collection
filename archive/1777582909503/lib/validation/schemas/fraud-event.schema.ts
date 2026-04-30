import { z } from "zod";

export const fraudEventSchema = z.object({
  id: z.string().optional(),

  signal: z.string(),
  orderId: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  ip: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  metadata: z.any().optional(),
});
