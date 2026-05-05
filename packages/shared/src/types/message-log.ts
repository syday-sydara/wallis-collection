import { z } from "zod";

export const MessageLogSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  direction: z.enum(["inbound", "outbound"]),
  status: z.enum(["queued", "sent", "delivered", "failed"]),
  body: z.string(),
  createdAt: z.string().datetime(),
});

export const MessageLogListSchema = z.array(MessageLogSchema);

export type MessageLog = z.infer<typeof MessageLogSchema>;
export type MessageLogList = z.infer<typeof MessageLogListSchema>;
