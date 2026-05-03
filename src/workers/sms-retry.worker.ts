// workers/sms-retry.worker.ts
import { Worker, Job } from "bullmq";
import { redis } from "../lib/queue/connection";
import { SmsProvider } from "../providers/sms.provider";
import { EmailProvider } from "../providers/email.provider";
import { logger } from "../lib/logger";
import { metrics } from "../lib/metrics";

const QUEUE_NAME = "sms.retry";

export const SmsRetryWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    const { to, text, subject } = job.data;

    logger.info("SMS retry worker processing job", {
      jobId: job.id,
      to,
    });

    // ---------------------------------------------------------
    // Tier 1: SMS
    // ---------------------------------------------------------
    try {
      await SmsProvider.send({ to, text });

      metrics.increment("sms.retry.success");
      logger.info("SMS retry succeeded", { jobId: job.id, to });

      return true;
    } catch (smsErr: any) {
      logger.warn("SMS retry failed, falling back to Email", {
        jobId: job.id,
        to,
        smsError: smsErr.message,
      });
    }

    // ---------------------------------------------------------
    // Tier 2: Email fallback
    // ---------------------------------------------------------
    try {
      await EmailProvider.send({ to, subject, text });

      metrics.increment("email.fallback.success");
      logger.info("Email fallback succeeded", { jobId: job.id, to });

      return true;
    } catch (emailErr: any) {
      metrics.increment("sms.retry.failure");

      logger.error("All fallback channels failed", {
        jobId: job.id,
        to,
        error: emailErr.message,
      });

      // Emit exhausted event
      redis.publish(
        "sms:events",
        JSON.stringify({
          type: "retry.exhausted",
          to,
          jobId: job.id,
          error: emailErr.message,
          timestamp: Date.now(),
        })
      );

      throw emailErr; // BullMQ will retry again
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
