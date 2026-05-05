// queues/reservation.expiry.queue.ts
import { Queue } from "bullmq";
import { connection } from "../config/redis";

// Shared constant — prevents name drift across producers/workers
export const RESERVATION_EXPIRY_QUEUE_NAME = "reservation.expiry";

/**
 * Reservation Expiry Queue
 *
 * Notes:
 * - Handles expiration of stock reservations
 * - Uses queue-level prefix "bull" to isolate BullMQ keys
 * - removeOnFail = false ensures failed expiry jobs remain visible
 * - Exponential backoff protects against transient DB/Redis issues
 */
export const reservationExpiryQueue = new Queue(RESERVATION_EXPIRY_QUEUE_NAME, {
  connection,
  prefix: "bull", // isolates BullMQ keys in Redis (Nigeria‑first reliability)

  defaultJobOptions: {
    attempts: 5, // expiry is critical — retry more aggressively
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// ---------------------------------------------------------
// Queue-level observability
// ---------------------------------------------------------

reservationExpiryQueue.on("error", err => {
  console.error("[RESERVATION EXPIRY QUEUE ERROR]", err);
});

reservationExpiryQueue.on("waiting", jobId => {
  console.log(`[RESERVATION EXPIRY QUEUE] Job waiting: ${jobId}`);
});

reservationExpiryQueue.on("active", job => {
  console.log(`[RESERVATION EXPIRY QUEUE] Job active: ${job.id}`);
});

reservationExpiryQueue.on("completed", job => {
  console.log(`[RESERVATION EXPIRY QUEUE] Job completed: ${job.id}`);
});

reservationExpiryQueue.on("failed", (job, err) => {
  console.error(`[RESERVATION EXPIRY QUEUE] Job failed: ${job?.id}`, err);
});
