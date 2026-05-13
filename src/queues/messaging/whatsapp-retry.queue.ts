import { logger } from "@/lib/logger";
import { metrics } from "@/lib/metrics";
import { correlationId } from "@/lib/correlation";

export class WhatsAppRetryQueue {
  static async enqueue(payload: any) {
    const traceId = correlationId("waq");
    const start = performance.now();

    try {
      logger.info("Enqueuing WhatsApp retry", { payload, traceId });

      // Simulated enqueue (replace with Redis/BullMQ later)
      console.log("📥 Enqueued WhatsApp retry:", payload);

      const duration = performance.now() - start;

      metrics.increment("whatsapp_retry_enqueued");
      metrics.timing("whatsapp_retry_enqueue_duration_ms", duration);

      logger.info("WhatsApp retry enqueued", {
        duration,
        traceId,
      });

      return { ok: true, traceId };
    } catch (err: any) {
      const duration = performance.now() - start;

      metrics.increment("whatsapp_retry_enqueue_failed");
      metrics.timing("whatsapp_retry_enqueue_duration_ms", duration);

      logger.error("Failed to enqueue WhatsApp retry", {
        error: err?.message,
        payload,
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
