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

export const DLQEntrySchema = z.object({
  id: z.string(),
  failedAt: z.string().datetime(),
  reason: z.string(),
  payload: z.any(),
});

export const DLQListSchema = z.array(DLQEntrySchema);

export const MessageLogSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  direction: z.enum(["inbound", "outbound"]),
  status: z.enum(["queued", "sent", "delivered", "failed"]),
  body: z.string(),
  createdAt: z.string().datetime(),
});

export const MessageLogListSchema = z.array(MessageLogSchema);
