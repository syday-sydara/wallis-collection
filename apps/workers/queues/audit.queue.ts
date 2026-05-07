// queues/audit.queue.ts
import { Queue } from "bullmq";
import { redis } from "@/queues/core/connection";
import { logger } from "@/lib/logger";
import { Correlation } from "@/lib/correlation";
import { metrics } from "@/lib/metrics";

// Shared constant — prevents name drift across producers/workers
export const AUDIT_QUEUE_NAME = "audit";

/**
 * Audit Queue
 *
 * Notes:
 * - Uses shared Redis connection WITHOUT keyPrefix (BullMQ requirement)
 * - Uses queue-level prefix "bull" to isolate BullMQ keys
 * - removeOnFail = false ensures failed audit jobs remain visible
 * - Producers MUST supply a deterministic jobId (e.g., logId)
 */
export const auditQueue = new Queue(AUDIT_QUEUE_NAME, {
  connection: redis,
  prefix: "bull",

  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "fixed", delay: 1000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// ---------------------------------------------------------
// Queue-level lifecycle logging (correlation-aware)
// ---------------------------------------------------------
auditQueue.on("error", (err) => {
  const ctx = Correlation.get();
  logger.error("[AUDIT QUEUE ERROR]", {
    ...ctx,
    error: err.message,
  });
  metrics.increment("queue.audit.error");
});

auditQueue.on("waiting", (jobId) => {
  const ctx = Correlation.get();
  logger.info("[AUDIT QUEUE] Job waiting", {
    ...ctx,
    jobId,
  });
  metrics.increment("queue.audit.waiting");
});

auditQueue.on("active", (job) => {
  const ctx = Correlation.get();
  logger.info("[AUDIT QUEUE] Job active", {
    ...ctx,
    jobId: job.id,
  });
  metrics.increment("queue.audit.active");
});

auditQueue.on("completed", (job) => {
  const ctx = Correlation.get();
  logger.info("[AUDIT QUEUE] Job completed", {
    ...ctx,
    jobId: job.id,
  });
  metrics.increment("queue.audit.completed");
});

auditQueue.on("failed", (job, err) => {
  const ctx = Correlation.get();
  logger.error("[AUDIT QUEUE] Job failed", {
    ...ctx,
    jobId: job?.id,
    error: err.message,
  });
  metrics.increment("queue.audit.failed");
});
