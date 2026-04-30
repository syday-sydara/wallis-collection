import { z } from "zod";

export const riskContextSchema = z.object({
  userId: z.string().nullable().optional(),
  ip: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  action: z.string().min(1),
  amount: z.number().nonnegative().optional(),
  country: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const riskResultSchema = z.object({
  score: z.number().min(0).max(100),
  block: z.boolean(),
  review: z.boolean(),
  triggeredRules: z.array(z.string()),
  classification: z.enum(["LOW", "MEDIUM", "HIGH"]),
});
