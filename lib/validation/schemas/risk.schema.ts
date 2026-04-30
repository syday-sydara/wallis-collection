import { z } from "zod";

export const riskContextSchema = z.object({
  userId: z.string().nullable().optional(),
  ip: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  action: z.string(),
  amount: z.number().nullable().optional(),
  country: z.string().nullable().optional(),
  metadata: z.any().optional(),
});

export const riskResultSchema = z.object({
  score: z.number().min(0).max(100),
  block: z.boolean(),
  review: z.boolean(),
  triggeredRules: z.array(z.string()),
  classification: z.enum(["LOW", "MEDIUM", "HIGH"]),
});
