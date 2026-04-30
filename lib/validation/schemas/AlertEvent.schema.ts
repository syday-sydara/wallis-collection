
// === AUTO-GENERATED START ===
import { z } from "zod";

export const AlertEventSchema = z.object({
  id: z.string(),
  event: z.string(),
  userId: z.string().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.any().optional(),
  createdAt: z.date(),
});
// === AUTO-GENERATED END ===
