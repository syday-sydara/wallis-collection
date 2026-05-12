import { logger } from "@/src/lib/logger";
import { metrics } from "@/src/lib/metrics";
import { correlationId } from "@/src/lib/correlation";
import { WhatsAppProvider } from "@/src/providers/whatsapp.provider";
import { WhatsAppRetryQueue } from "@/src/queues/messaging/whatsapp-retry.queue";

export class WhatsAppRetryWorker {
  static async process(job: any) {
    const traceId = correlationId("waw");
    const start = performance.now();

    logger.info("Processing WhatsApp retry job", { job, traceId });

    try {
      const { phone, message, attempt = 1 } = job;

      const result = await WhatsAppProvider.sendMessage(phone, message);

      const duration = performance.now() - start;

      if (result.ok) {
        metrics.increment("whatsapp_retry_success");
        metrics.timing("whatsapp_retry_process_duration_ms", duration);

        logger.info("WhatsApp retry succeeded", {
          phone,
          attempt,
          duration,
          traceId,
        });

        return { ok: true, traceId };
      }

      // If failed → schedule another retry
      const nextAttempt = attempt + 1;

      if (nextAttempt <= 3) {
        await WhatsAppRetryQueue.enqueue({
          phone,
          message,
          attempt: nextAttempt,
        });

        logger.warn("WhatsApp retry failed, re-enqueued", {
          phone,
          attempt,
          nextAttempt,
          traceId,
        });

        metrics.increment("whatsapp_retry_requeued");

        return { ok: false, retry: true, traceId };
      }

      // Max retries reached
      logger.error("WhatsApp retry permanently failed", {
        phone,
        attempt,
        traceId,
      });

      metrics.increment("whatsapp_retry_dead_letter");

      return { ok: false, retry: false, traceId };
    } catch (err: any) {
      const duration = performance.now() - start;

      metrics.increment("whatsapp_retry_worker_error");
      metrics.timing("whatsapp_retry_process_duration_ms", duration);

      logger.error("WhatsApp retry worker crashed", {
        error: err?.message,
        job,
        traceId,
      });

      return {
        ok: false,
        error: err?.message ?? "Unknown error",
        traceId,
      };
    }
  }
}
