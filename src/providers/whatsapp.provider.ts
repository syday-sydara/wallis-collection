// providers/whatsapp.provider.ts
import axios from "axios";
import { WhatsAppBreaker } from "../lib/circuit-breakers";
import { WhatsAppRetryQueue } from "../queues/messaging/whatsapp-retry.queue";
import { retryWithBackoff } from "../lib/retry";
import { logger } from "../lib/logger";
import { metrics } from "../lib/metrics";
import { DeliveryLog } from "../lib/delivery-log";

interface WhatsAppSendInput {
  to: string;
  template: string;
  variables: any;
  text?: string;       // needed for SMS fallback
  subject?: string;    // needed for Email fallback
}

export const WhatsAppProvider = {
  async send(input: WhatsAppSendInput) {
    // ---------------------------------------------------------
    // Breaker OPEN → queue immediately
    // ---------------------------------------------------------
    if (WhatsAppBreaker.getState() === "OPEN") {
      logger.warn("WhatsApp breaker OPEN — queuing message", { to: input.to });
      metrics.increment("whatsapp.fallback.queued");

      await DeliveryLog.write({
        channel: "whatsapp",
        status: "QUEUED",
        payload: input,
        metadata: { reason: "breaker-open" },
      });

      return WhatsAppRetryQueue.enqueue({
        to: input.to,
        template: input.template,
        variables: input.variables,
        text: input.text ?? "Notification",
        subject: input.subject ?? "Notification",
      });
    }

    // ---------------------------------------------------------
    // Normal execution path
    // ---------------------------------------------------------
    return WhatsAppBreaker.exec(async () => {
      const start = Date.now();

      try {
        const result = await retryWithBackoff(async () => {
          const res = await axios.post(
            "https://graph.facebook.com/v18.0/...",
            {
              to: input.to,
              template: input.template,
              components: input.variables,
            },
            {
              timeout: 5000,
              validateStatus: () => true,
            }
          );

          if (res.status >= 400) {
            throw new Error(
              `WhatsApp HTTP ${res.status}: ${JSON.stringify(res.data)}`
            );
          }

          if (res.data?.error) {
            throw new Error(
              `WhatsApp logical error: ${JSON.stringify(res.data.error)}`
            );
          }

          return res.data;
        });

        metrics.observe("whatsapp.latency", Date.now() - start);
        metrics.increment("whatsapp.success");

        // AUDIT LOG: SENT
        await DeliveryLog.write({
          channel: "whatsapp",
          status: "SENT",
          payload: input,
          metadata: { providerResponse: result },
        });

        return result;
      } catch (err: any) {
        metrics.increment("whatsapp.failure");

        logger.error("WhatsApp provider failure", {
          error: err.message,
          to: input.to,
        });

        // AUDIT LOG: FAILED
        await DeliveryLog.write({
          channel: "whatsapp",
          status: "FAILED",
          error: err.message,
          payload: input,
        });

        throw new Error(`WhatsAppProvider failure: ${err.message}`);
      }
    });
  },
};
