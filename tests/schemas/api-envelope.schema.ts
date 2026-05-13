import { z } from "zod";

export const ApiSuccessSchema = z.object({
  ok: z.literal(true),

  // Flexible but type-safe
  data: z.unknown(),

  // Optional metadata
  meta: z.record(z.unknown()).optional(),

  traceId: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  path: z.string().optional(),
});

export const ApiErrorSchema = z.object({
  ok: z.literal(false),

  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.unknown().optional(),
  }),

  status: z.number().optional(),
  traceId: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  path: z.string().optional(),
});
