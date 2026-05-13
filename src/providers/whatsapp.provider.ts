import { logger } from "@/lib/logger";
import { metrics } from "@/lib/metrics";
import { correlationId } from "@/lib/correlation";

export class WhatsAppProvider {
  static async sendMessage(phone: string, message: string) {
    const traceId = correlationId("wa");
    const start = performance.now();

    try {
      logger.info("Sending WhatsApp message", { phone, traceId });

      // Simulated send (replace with real API call later)
      console.log(`📨 WhatsApp → ${phone}: ${message}`);

      const duration = performance.now() - start;

      metrics.increment("whatsapp_send_success", { phone });
      metrics.timing("whatsapp_send_duration_ms", duration, { phone });

      logger.info("WhatsApp message sent", {
        phone,
        duration,
        traceId,
      });

      return { ok: true, traceId };
    } catch (err: any) {
      const duration = performance.now() - start;

      metrics.increment("whatsapp_send_failed", { phone });
      metrics.timing("whatsapp_send_duration_ms", duration, { phone });

      logger.error("WhatsApp send failed", {
        phone,
        error: err?.message,
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
