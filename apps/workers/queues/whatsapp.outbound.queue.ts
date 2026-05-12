// queues/whatsapp.outbound.queue.ts
import { Queue } from "bullmq";
import { redis } from "@/queues/core/connection";
import { logger } from "@/lib/logger";
import { Correlation } from "@/lib/correlation";
import { metrics } from "@/lib/metrics";

// Shared constant — prevents name drift across producers/workers
export const WHATSAPP_OUTBOUND_QUEUE_NAME = "whatsapp.outbound";

/**
 * WhatsApp Outbound Queue
 *
 * Notes:
 * - Handles outbound WhatsApp messages (template + session-based)
 * - Uses queue-level prefix "bull" to isolate BullMQ keys
 * - removeOnFail = false ensures failed sends remain visible
 * - Exponential backoff protects against provider throttling
 */
export const whatsappOutboundQueue = new Queue(
  WHATSAPP_OUTBOUND_QUEUE_NAME,
  {
    connection: redis,
    prefix: "bull",

    defaultJobOptions: {
      attempts: 5,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: true,
      removeOnFail: false,
    },
  }
);

// ---------------------------------------------------------
// Queue-level observability (correlation-aware)
// ---------------------------------------------------------
whatsappOutboundQueue.on("error", (err) => {
  const ctx = Correlation.get();
  logger.error("[WHATSAPP OUTBOUND QUEUE ERROR]", {
    ...ctx,
    error: err.message,
  });
  metrics.increment("queue.whatsappOutbound.error");
});

whatsappOutboundQueue.on("active", (job) => {
  const ctx = Correlation.get();
  logger.info("[WHATSAPP OUTBOUND QUEUE] Job active", {
    ...ctx,
    jobId: job.id,
  });
  metrics.increment("queue.whatsappOutbound.active");
});

whatsappOutboundQueue.on("completed", (job) => {
  const ctx = Correlation.get();
  logger.info("[WHATSAPP OUTBOUND QUEUE] Job completed", {
    ...ctx,
    jobId: job.id,
  });
  metrics.increment("queue.whatsappOutbound.completed");
});

whatsappOutboundQueue.on("failed", (job, err) => {
  const ctx = Correlation.get();
  logger.error("[WHATSAPP OUTBOUND QUEUE] Job failed", {
    ...ctx,
    jobId: job?.id,
    error: err.message,
  });
  metrics.increment("queue.whatsappOutbound.failed");
});
