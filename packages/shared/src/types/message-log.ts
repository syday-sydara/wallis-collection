import { z } from "zod";

export const MessageLogErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  providerStatus: z.number().optional(),
  raw: z.any().optional(),
});

export const MessageLogSchema = z.object({
  id: z.string(),

  // Correlation metadata
  sessionId: z.string().nullable().optional(),
  orderId: z.string().nullable().optional(),
  customerId: z.string().nullable().optional(),
  phoneNormalized: z.string().nullable().optional(),
  eventName: z.string().nullable().optional(),
  traceId: z.string().nullable().optional(),

  // Channel + direction
  channel: z.enum(["whatsapp", "sms", "email"]),
  direction: z.enum(["inbound", "outbound"]).optional(),

  // Delivery status
  status: z.enum(["SENT", "FAILED", "FALLBACK", "RETRY", "QUEUED"]),

  // Provider metadata
  messageId: z.string().nullable().optional(),
  providerMessageId: z.string().nullable().optional(),

  // Message body
  body: z.string().nullable().optional(),

  // Raw payload + metadata
  payload: z.any().nullable().optional(),
  metadata: z.any().nullable().optional(),

  // Error (if failed)
  error: MessageLogErrorSchema.nullable().optional(),

  createdAt: z.string().datetime(),
});

export const MessageLogListSchema = z.array(MessageLogSchema);

export type MessageLog = z.infer<typeof MessageLogSchema>;
export type MessageLogList = z.infer<typeof MessageLogListSchema>;
