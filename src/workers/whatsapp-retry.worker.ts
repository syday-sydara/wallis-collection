// workers/whatsapp-retry.worker.ts
import { Worker, Job } from "bullmq";
import { redis } from "../lib/queue/connection";
import { WhatsAppProvider } from "../providers/whatsapp.provider";
import { logger } from "../lib/logger";
import { metrics } from "../lib/metrics";

const QUEUE_NAME = "whatsapp.retry";

export const WhatsAppRetryWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    const { to, template, variables } = job.data;

    logger.info("WhatsApp retry worker processing job", {
      jobId: job.id,
      to,
    });

    try {
      await WhatsAppProvider.send({ to, template, variables });

      metrics.increment("whatsapp.retry.success");

      logger.info("WhatsApp retry succeeded", {
        jobId: job.id,
        to,
      });

      return true;
    } catch (err: any) {
      metrics.increment("whatsapp.retry.failure");

      logger.error("WhatsApp retry failed", {
        jobId: job.id,
        to,
        error: err.message,
      });

      throw err; // BullMQ will retry
    }
  },
  { connection: redis }
);

WhatsAppRetryWorker.on("completed", (job) => {
  logger.info("WhatsApp retry job completed", { jobId: job.id });
});

WhatsAppRetryWorker.on("failed", (job, err) => {
  logger.error("WhatsApp retry job failed", {
    jobId: job?.id,
    error: err?.message,
  });
});
