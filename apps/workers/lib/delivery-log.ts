// lib/delivery-log.ts
import { prisma } from "./prisma";
import { Correlation } from "./correlation";
import { logger } from "./logger";

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
  workflowId?: string;

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
          // ------------------------------------------------------
          // Core delivery metadata
          // ------------------------------------------------------
          channel: input.channel,
          status: input.status,

          // ------------------------------------------------------
          // Full correlation context
          // ------------------------------------------------------
          traceId: ctx.traceId,
          requestId: ctx.requestId,
          spanId: ctx.spanId,
          parentSpanId: ctx.parentSpanId ?? null,
          workflowId: input.workflowId ?? ctx.workflowId ?? null,

          sessionId: input.sessionId ?? ctx.sessionId ?? null,
          orderId: input.orderId ?? ctx.orderId ?? null,
          customerId: input.customerId ?? ctx.customerId ?? null,

          // ------------------------------------------------------
          // Additional correlation metadata
          // ------------------------------------------------------
          phoneNormalized: input.phoneNormalized ?? null,
          eventName: input.eventName ?? null,

          // ------------------------------------------------------
          // Provider metadata
          // ------------------------------------------------------
          messageId: input.messageId ?? null,
          providerMessageId: input.providerMessageId ?? null,

          // ------------------------------------------------------
          // Error metadata (safe JSON)
          // ------------------------------------------------------
          error: input.error
            ? safeJson(input.error)
            : null,

          // ------------------------------------------------------
          // Raw payload + metadata (safe JSON)
          // ------------------------------------------------------
          payload: input.payload
            ? safeJson(input.payload)
            : null,

          metadata: input.metadata
            ? safeJson(input.metadata)
            : null,
        },
      });
    } catch (err: any) {
      logger.error("[DeliveryLog] Failed to write log", {
        error: err.message,
        traceId: ctx.traceId,
        spanId: ctx.spanId,
      });

      // Delivery logging must never break the pipeline
      return null;
    }
  },
};

// ------------------------------------------------------
// Safe JSON serializer (prevents circular structure crashes)
// ------------------------------------------------------
function safeJson(value: any) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return { error: "Unserializable payload" };
  }
}
