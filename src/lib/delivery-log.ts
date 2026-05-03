// lib/delivery-log.ts
import { prisma } from "./prisma";

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
    try {
      return await prisma.messageDeliveryLog.create({
        data: {
          channel: input.channel,
          status: input.status,

          orderId: input.orderId ?? null,
          sessionId: input.sessionId ?? null,
          customerId: input.customerId ?? null,
          phoneNormalized: input.phoneNormalized ?? null,
          eventName: input.eventName ?? null,

          messageId: input.messageId ?? null,
          providerMessageId: input.providerMessageId ?? null,

          error: input.error ?? null,
          payload: input.payload ?? null,
          metadata: input.metadata ?? null,
        },
      });
    } catch (err) {
      console.error("[DeliveryLog] Failed to write log", err);
      // Never throw — logging must not break the pipeline
      return null;
    }
  },
};
