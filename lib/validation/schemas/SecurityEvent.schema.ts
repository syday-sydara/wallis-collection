
// === AUTO-GENERATED START ===
import { z } from "zod";

export const SecurityEventSchema = z.object({
  id: z.string(),
  version: z.number(),
  type: z.string(),
  message: z.string(),
  severity: z.string(),
  category: z.string().optional(),
  context: z.string().optional(),
  source: z.string().optional(),
  requestId: z.string().optional(),
  actorType: z.string(),
  actorId: z.string().optional(),
  orderId: z.string().optional(),
  fulfillmentId: z.string().optional(),
  riderId: z.string().optional(),
  riskScore: z.number().optional(),
  tags: z.array(z.string()),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  metadata: z.any().optional(),
  timestamp: z.date(),
  createdAt: z.date(),
});
// === AUTO-GENERATED END ===
