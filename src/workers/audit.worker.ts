// workers/audit.worker.ts
import { Worker } from "bullmq";
import { AUDIT_QUEUE_NAME } from "../queues/audit.queue";
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

          // Idempotency: ensure we don't double-process
          const existing = await prisma.auditLog.findUnique({
            where: { id: logId },
            select: { processedAt: true },
          });

          if (existing?.processedAt) {
            console.log(`[AUDIT WORKER] Skipping already processed log ${logId}`);
            return;
          }

          // Mark audit log as processed
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

// Worker lifecycle logging
auditWorker.on("ready", () => {
  console.log("[AUDIT WORKER] Ready");
});

auditWorker.on("completed", job => {
  console.log(`[AUDIT WORKER] Completed job ${job.id}`);
});

auditWorker.on("failed", (job, err) => {
  console.error(`[AUDIT WORKER] Job failed ${job?.id}`, err);
});

auditWorker.on("error", err => {
  console.error("[AUDIT WORKER] Worker error", err);
});

// Graceful shutdown (optional)
process.on("SIGTERM", async () => {
  console.log("[AUDIT WORKER] Shutting down...");
  await auditWorker.close();
  await prisma.$disconnect();
});
