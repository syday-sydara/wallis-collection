// queues/audit.queue.ts
import { Queue } from "bullmq";
import { connection } from "../config/redis";

// Shared constant — prevents name drift across producers/workers
export const AUDIT_QUEUE_NAME = "audit";

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
