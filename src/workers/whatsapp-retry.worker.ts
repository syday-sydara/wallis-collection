// workers/whatsapp-retry.worker.ts
import { Worker, Job } from "bullmq";
import { redis } from "../lib/queue/connection";
import { WhatsAppProvider } from "../providers/whatsapp.provider";
import { SmsProvider } from "../providers/sms.provider";
import { EmailProvider } from "../providers/email.provider";
import { logger } from "../lib/logger";
import { metrics } from "../lib/metrics";

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
    // Tier 1: WhatsApp
    // ---------------------------------------------------------
    try {
      await WhatsAppProvider.send({ to, template, variables });

      metrics.increment("whatsapp.retry.success");
      logger.info("WhatsApp retry succeeded", { jobId: job.id, to });

      return true;
    } catch (waErr: any) {
      logger.warn("WhatsApp retry failed, falling back to SMS", {
        jobId: job.id,
        to,
        error: waErr.message,
      });
    }

    // ---------------------------------------------------------
    // Tier 2: SMS fallback
    // ---------------------------------------------------------
    try {
      await SmsProvider.send({ to, text });

      metrics.increment("sms.fallback.success");
      logger.info("SMS fallback succeeded", { jobId: job.id, to });

      return true;
    } catch (smsErr: any) {
      logger.warn("SMS fallback failed, falling back to Email", {
        jobId: job.id,
        to,
        error: smsErr.message,
      });
    }

    // ---------------------------------------------------------
    // Tier 3: Email fallback
    // ---------------------------------------------------------
    try {
      await EmailProvider.send({ to, subject, text });

      metrics.increment("email.fallback.success");
      logger.info("Email fallback succeeded", { jobId: job.id, to });

      return true;
    } catch (emailErr: any) {
      metrics.increment("whatsapp.retry.failure");

      logger.error("All fallback channels failed", {
        jobId: job.id,
        to,
        error: emailErr.message,
      });

      throw emailErr; // BullMQ will retry again
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
