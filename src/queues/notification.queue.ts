// queues/notification.queue.ts
import { Queue } from "bullmq";
import { connection } from "../config/env";

// Shared constant — prevents name drift across producers/workers
export const NOTIFICATION_QUEUE_NAME = "notification";

/**
 * Notification Queue
 *
 * Notes:
 * - Uses Redis connection WITHOUT keyPrefix (BullMQ requirement)
 * - Uses queue-level prefix "bull:" to isolate BullMQ keys
 * - removeOnFail = false ensures failed notifications remain visible
 * - Notifications often require retries due to provider throttling
 */
export const notificationQueue = new Queue(NOTIFICATION_QUEUE_NAME, {
  connection,
  prefix: "bull", // isolates BullMQ keys in Redis (Nigeria‑first reliability)

  defaultJobOptions: {
    attempts: 5, // notifications often need retries
    backoff: {
      type: "exponential",
      delay: 2000, // exponential backoff for provider throttling
    },
    removeOnComplete: true,
    removeOnFail: false, // keep failed notifications for inspection
  },

  // Optional: rate limit to avoid provider throttling
  // limiter: {
  //   max: 20,
  //   duration: 1000, // 20 notifications per second
  // },
});

// Optional: queue-level event logging for observability
notificationQueue.on("error", (err) => {
  console.error("[NOTIFICATION QUEUE ERROR]", err);
});

notificationQueue.on("waiting", (jobId) => {
  console.log(`[NOTIFICATION QUEUE] Job waiting: ${jobId}`);
});

notificationQueue.on("failed", (job, err) => {
  console.error(`[NOTIFICATION QUEUE] Job failed: ${job?.id}`, err);
});
