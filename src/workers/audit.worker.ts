// workers/audit.worker.ts
import { Worker } from "bullmq";
import { auditQueue, AUDIT_QUEUE_NAME } from "../queues/audit.queue";
import { connection } from "../config/redis";
import { prisma } from "../config/prisma";
import { Events } from "../events";
import type { EventPayloads, EventName } from "../events/payloads";

export const auditWorker = new Worker<EventPayloads[EventName]>(
  AUDIT_QUEUE_NAME,
  async job => {
    const event = job.name as EventName;
    const payload = job.data as EventPayloads[typeof event];

    try {
      switch (event) {
        case Events.AUDIT_LOG_CREATED: {
          const { logId } = payload;

          // Persist audit log
          await prisma.auditLog.update({
            where: { id: logId },
            data: { processedAt: new Date() },
          });

          break;
        }

        default:
          throw new Error(`Unhandled audit event: ${event}`);
      }
    } catch (err) {
      console.error(`[AUDIT WORKER] Error processing ${event}`, err);
      throw err; // allow BullMQ retry
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

// Worker-level logging
auditWorker.on("completed", job => {
  console.log(`[AUDIT WORKER] Completed job ${job.id}`);
});

auditWorker.on("failed", (job, err) => {
  console.error(`[AUDIT WORKER] Job failed ${job?.id}`, err);
});

auditWorker.on("error", err => {
  console.error("[AUDIT WORKER] Worker error", err);
});
