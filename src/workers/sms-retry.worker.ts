// workers/sms-retry.worker.ts
import { Worker, Job } from "bullmq";
import { redis } from "../lib/queue/connection";
import { SmsProvider } from "../providers/sms.provider";
import { EmailProvider } from "../providers/email.provider";
import { logger } from "../lib/logger";
import { metrics } from "../lib/metrics";
import { DeliveryLog } from "../lib/delivery-log";
import { SmsDLQ } from "../queues/messaging/sms.dlq.queue";   // <-- NEW

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
    // Tier 1: SMS retry
    // ---------------------------------------------------------
    try {
      await SmsProvider.send({ to, text, subject });

      metrics.increment("sms.retry.success");

      await DeliveryLog.write({
        channel: "sms",
        status: "RETRY",
        payload: job.data,
        metadata: { attempt: job.attemptsMade },
      });

      logger.info("SMS retry succeeded", { jobId: job.id, to });
      return true;
    } catch (smsErr: any) {
      logger.warn("SMS retry failed, falling back to Email", {
        jobId: job.id,
        to,
        smsError: smsErr.message,
      });

      await DeliveryLog.write({
        channel: "sms",
        status: "FALLBACK",
        error: smsErr.message,
        payload: job.data,
        metadata: { fallbackTo: "email" },
      });
    }

    // ---------------------------------------------------------
    // Tier 2: Email fallback
    // ---------------------------------------------------------
    try {
      await EmailProvider.send({
        to,
        subject,
        text,
        html: `<p>${text}</p>`,
      });

      metrics.increment("email.fallback.success");

      await DeliveryLog.write({
        channel: "email",
        status: "SENT",
        payload: job.data,
        metadata: { via: "sms-fallback" },
      });

      logger.info("Email fallback succeeded", { jobId: job.id, to });
      return true;
    } catch (emailErr: any) {
      metrics.increment("sms.retry.failure");

      logger.error("All fallback channels failed", {
        jobId: job.id,
        to,
        error: emailErr.message,
      });

      await DeliveryLog.write({
        channel: "email",
        status: "FAILED",
        error: emailErr.message,
        payload: job.data,
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

      // Push to DLQ
      await SmsDLQ.add("dead-letter", job.data);

      throw emailErr; // BullMQ will retry again if attempts remain
    }
  },
  { connection: redis }
);

// ---------------------------------------------------------
// Worker lifecycle events
// ---------------------------------------------------------
SmsRetryWorker.on("completed", (job) => {
  logger.info("SMS retry job completed", { jobId: job.id });
});

SmsRetryWorker.on("failed", (job, err) => {
  logger.error("SMS retry job failed", {
    jobId: job?.id,
    error: err?.message,
  });
});
