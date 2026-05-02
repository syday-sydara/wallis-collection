// queues/audit.queue.ts
import { Queue } from "bullmq";
import { connection } from "../config/redis";

// Shared constant — prevents name drift across producers/workers
export const AUDIT_QUEUE_NAME = "audit";

/**
 * Audit Queue
 *
 * Notes:
 * - Uses Redis connection WITHOUT keyPrefix (BullMQ requirement)
 * - Uses queue-level prefix "bull:" to isolate BullMQ keys
 * - removeOnFail = false ensures failed audit jobs remain visible
 * - Producers MUST supply a deterministic jobId (e.g., logId)
 */
export const auditQueue = new Queue(AUDIT_QUEUE_NAME, {
  connection,
  prefix: "bull", // isolates BullMQ keys in Redis (Nigeria‑first reliability)

  defaultJobOptions: {
    attempts: 3, // retry transient failures
    backoff: { type: "fixed", delay: 1000 }, // simple retry strategy
    removeOnComplete: true,
    removeOnFail: false, // keep failed jobs for debugging
  },

  // Optional: rate limit if audit logs spike heavily
  // limiter: {
  //   max: 100,
  //   duration: 1000,
  // },
});

// Optional: queue-level event logging for observability
auditQueue.on("error", (err) => {
  console.error("[AUDIT QUEUE ERROR]", err);
});

auditQueue.on("waiting", (jobId) => {
  console.log(`[AUDIT QUEUE] Job waiting: ${jobId}`);
});

auditQueue.on("failed", (job, err) => {
  console.error(`[AUDIT QUEUE] Job failed: ${job?.id}`, err);
});
