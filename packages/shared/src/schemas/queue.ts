import { z } from "zod";

export const QueueStatsSchema = z.object({
  name: z.string(),
  waiting: z.number(),
  active: z.number(),
  completed: z.number(),
  failed: z.number(),
  delayed: z.number(),
});

export const QueueStatsListSchema = z.array(QueueStatsSchema);

export type QueueStats = z.infer<typeof QueueStatsSchema>;
export type QueueStatsList = z.infer<typeof QueueStatsListSchema>;
