// === AUTO-GENERATED START ===
import { z } from "zod";

export const FraudEventSchema = z.object({
  id: z.string(),
  signal: z.string(),
  orderId: z.string().optional(),
  userId: z.string().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.any().optional(),
  createdAt: z.date(),
});
// === AUTO-GENERATED END ===
