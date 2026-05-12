import { z } from "zod";

export const ApiSuccessSchema = z.object({
  ok: z.literal(true),
  data: z.any(),
  meta: z.record(z.any()).optional(),
  traceId: z.string().optional(),
  timestamp: z.string().optional(),
  path: z.string().optional(),
});

export const ApiErrorSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.any().optional(),
  }),
  status: z.number().optional(),
  traceId: z.string().optional(),
  timestamp: z.string().optional(),
  path: z.string().optional(),
});
