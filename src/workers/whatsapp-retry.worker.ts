// workers/whatsapp-retry.worker.ts
import { Worker, Job } from "bullmq";
import { redis } from "../lib/queue/connection";
import { WhatsAppProvider } from "../providers/whatsapp.provider";
import { SmsProvider } from "../providers/sms.provider";
import { EmailProvider } from "../providers/email.provider";
import { logger } from "../lib/logger";
import { metrics } from "../lib/metrics";
import { DeliveryLog } from "../lib/delivery-log";
import { WhatsAppDLQ } from "../queues/messaging/whatsapp.dlq.queue"; // NEW

const QUEUE_NAME = "whatsapp.retry";

export const WhatsAppRetryWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    const { to, template, variables, text, subject } = job.data;

    logger.info("WhatsApp retry worker processing job", {
      jobId: job.id,
      to,
    });

    // ---------------------------------------------------------
    // Tier 1: WhatsApp retry
    // ---------------------------------------------------------
    try {
      await WhatsAppProvider.send({ to, template, variables, text, subject });

      metrics.increment("whatsapp.retry.success");

      await DeliveryLog.write({
        channel: "whatsapp",
        status: "RETRY",
        payload: job.data,
        metadata: { attempt: job.attemptsMade },
      });

      logger.info("WhatsApp retry succeeded", { jobId: job.id, to });
      return true;
    } catch (waErr: any) {
      logger.warn("WhatsApp retry failed, falling back to SMS", {
        jobId: job.id,
        to,
        error: waErr.message,
      });

      await DeliveryLog.write({
        channel: "whatsapp",
        status: "FALLBACK",
        error: waErr.message,
        payload: job.data,
        metadata: { fallbackTo: "sms" },
      });
    }

    // ---------------------------------------------------------
    // Tier 2: SMS fallback
    // ---------------------------------------------------------
    try {
      await SmsProvider.send({ to, text, subject });

      metrics.increment("sms.fallback.success");

      await DeliveryLog.write({
        channel: "sms",
        status: "SENT",
        payload: job.data,
        metadata: { via: "whatsapp-fallback" },
      });

      logger.info("SMS fallback succeeded", { jobId: job.id, to });
      return true;
    } catch (smsErr: any) {
      logger.warn("SMS fallback failed, falling back to Email", {
        jobId: job.id,
        to,
        error: smsErr.message,
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
    // Tier 3: Email fallback
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
        metadata: { via: "whatsapp-sms-fallback" },
      });

      logger.info("Email fallback succeeded", { jobId: job.id, to });
      return true;
    } catch (emailErr: any) {
      metrics.increment("whatsapp.retry.failure");

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
        "whatsapp:events",
        JSON.stringify({
          type: "retry.exhausted",
          to,
          jobId: job.id,
          error: emailErr.message,
          timestamp: Date.now(),
        })
      );

      // Push to DLQ
      await WhatsAppDLQ.add("dead-letter", job.data);

      throw emailErr; // BullMQ will retry again if attempts remain
    }
  },
  { connection: redis }
);

// ---------------------------------------------------------
// Worker lifecycle events
// ---------------------------------------------------------
WhatsAppRetryWorker.on("completed", (job) => {
  logger.info("WhatsApp retry job completed", { jobId: job.id });
});

WhatsAppRetryWorker.on("failed", (job, err) => {
  logger.error("WhatsApp retry job failed", {
    jobId: job?.id,
    error: err?.message,
  });
});
