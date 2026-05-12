import { z } from "zod";

export const DLQErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  stack: z.string().optional(),
});

export const DLQEntrySchema = z.object({
  id: z.string(),

  dlqVersion: z.number(),
  timestamp: z.number(),
  retryable: z.boolean(),

  originalQueue: z.string(),
  originalJobName: z.string(),
  originalPayload: z.any(),

  traceId: z.string().nullable().optional(),
  dlqReason: z.string().optional(),

  error: DLQErrorSchema,

  attemptsMade: z.number(),
  maxAttempts: z.number(),
});

export const DLQListSchema = z.array(DLQEntrySchema);

export type DLQEntry = z.infer<typeof DLQEntrySchema>;
export type DLQList = z.infer<typeof DLQListSchema>;
