import { z } from "zod";

export const QueueMetricsSchema = z.object({
  avgWaitMs: z.number().nullable().optional(),
  avgProcessMs: z.number().nullable().optional(),
  timestamp: z.number().nullable().optional(),
});

export const QueueStatsSchema = z.object({
  name: z.string(),

  // Core counters
  waiting: z.number(),
  active: z.number(),
  completed: z.number(),
  failed: z.number(),
  delayed: z.number(),
  paused: z.number().nullable().optional(),
  waitingChildren: z.number().nullable().optional(),
  prioritized: z.number().nullable().optional(),

  // Queue state
  isPaused: z.boolean().optional(),
  isRunning: z.boolean().optional(),
  rateLimited: z.boolean().optional(),

  // Metadata
  queuePrefix: z.string().optional(),
  host: z.string().optional(),
  queueType: z.enum(["worker", "scheduler", "events"]).optional(),

  // Metrics
  metrics: QueueMetricsSchema.optional(),

  // Last activity
  lastJobTimestamp: z.number().nullable().optional(),
});

export const QueueStatsListSchema = z.array(QueueStatsSchema);

export type QueueStats = z.infer<typeof QueueStatsSchema>;
export type QueueStatsList = z.infer<typeof QueueStatsListSchema>;
