// workers/sms-retry.worker.ts
import { Worker, Job } from "bullmq";
import { redis } from "../lib/queue/connection";
import { SmsProvider } from "../providers/sms.provider";
import { logger } from "../lib/logger";
import { metrics } from "../lib/metrics";

const QUEUE_NAME = "sms.retry";

export const SmsRetryWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    const { to, text } = job.data;

    logger.info("SMS retry worker processing job", {
      jobId: job.id,
      to,
    });

    try {
      await SmsProvider.send({ to, text });

      metrics.increment("sms.retry.success");

      logger.info("SMS retry succeeded", {
        jobId: job.id,
        to,
      });

      return true;
    } catch (err: any) {
      metrics.increment("sms.retry.failure");

      logger.error("SMS retry failed", {
        jobId: job.id,
        to,
        error: err.message,
      });

      throw err; // let BullMQ handle retries
    }
  },
  { connection: redis }
);

SmsRetryWorker.on("completed", (job) => {
  logger.info("SMS retry job completed", { jobId: job.id });
});

SmsRetryWorker.on("failed", (job, err) => {
  logger.error("SMS retry job failed", {
    jobId: job?.id,
    error: err?.message,
  });
});
