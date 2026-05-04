// lib/delivery-log.ts
import { prisma } from "./prisma";
import { Correlation } from "./correlation";

export type DeliveryStatus =
  | "SENT"
  | "FAILED"
  | "FALLBACK"
  | "RETRY"
  | "QUEUED";

interface LogInput {
  channel: "whatsapp" | "sms" | "email";
  status: DeliveryStatus;

  // Correlation metadata
  orderId?: string;
  sessionId?: string;
  customerId?: string;
  phoneNormalized?: string;
  eventName?: string;

  // Provider metadata
  messageId?: string;
  providerMessageId?: string;

  // Error metadata
  error?: {
    message: string;
    code?: string;
    providerStatus?: number;
    raw?: any;
  };

  payload?: any;
  metadata?: any;
}

export const DeliveryLog = {
  async write(input: LogInput) {
    const ctx = Correlation.get();

    try {
      return await prisma.messageDeliveryLog.create({
        data: {
          channel: input.channel,
          status: input.status,

          // Correlation context
          traceId: ctx.traceId,
          requestId: ctx.requestId,
          spanId: ctx.spanId,
          sessionId: input.sessionId ?? ctx.sessionId ?? null,
          orderId: input.orderId ?? ctx.orderId ?? null,
          customerId: input.customerId ?? ctx.customerId ?? null,

          // Additional correlation metadata
          phoneNormalized: input.phoneNormalized ?? null,
          eventName: input.eventName ?? null,

          // Provider metadata
          messageId: input.messageId ?? null,
          providerMessageId: input.providerMessageId ?? null,

          // Error metadata
          error: input.error ?? null,

          // Raw payload + metadata
          payload: input.payload ?? null,
          metadata: input.metadata ?? null,
        },
      });
    } catch (err) {
      console.error("[DeliveryLog] Failed to write log", err);
      return null; // logging must never break the pipeline
    }
  },
};
