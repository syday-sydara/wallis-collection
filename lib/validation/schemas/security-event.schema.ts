import { z } from "zod";

export const securityEventSchema = z.object({
  id: z.string().optional(),

  version: z.number().default(3),

  type: z.string(),
  message: z.string(),
  severity: z.string(),
  category: z.string().nullable().optional(),
  context: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
  requestId: z.string().nullable().optional(),

  actorType: z.string(),
  actorId: z.string().nullable().optional(),

  orderId: z.string().nullable().optional(),
  fulfillmentId: z.string().nullable().optional(),
  riderId: z.string().nullable().optional(),

  riskScore: z.number().nullable().optional(),
  tags: z.array(z.string()).default([]),

  ip: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),

  metadata: z.any().optional(),
});
