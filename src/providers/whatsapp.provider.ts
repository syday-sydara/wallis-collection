// providers/whatsapp.provider.ts
import axios from "axios";
import { WhatsAppBreaker } from "../lib/circuit-breakers";
import { WhatsAppRetryQueue } from "../queues/whatsapp-retry.queue";   // FIXED
import { retryWithBackoff } from "../lib/retry";                       // FIXED
import { logger } from "../lib/logger";
import { metrics } from "../lib/metrics";

interface WhatsAppSendInput {
  to: string;
  template: string;
  variables: any;
  text?: string;       // needed for SMS fallback
  subject?: string;    // needed for Email fallback
}

export const WhatsAppProvider = {
  async send(input: WhatsAppSendInput) {
    // If breaker is OPEN → fallback immediately
    if (WhatsAppBreaker.getState() === "OPEN") {
      logger.warn("WhatsApp breaker OPEN — queuing message", { to: input.to });
      metrics.increment("whatsapp.fallback.queued");

      // IMPORTANT: include fallback fields
      return WhatsAppRetryQueue.enqueue({
        to: input.to,
        template: input.template,
        variables: input.variables,
        text: input.text ?? "Notification",
        subject: input.subject ?? "Notification",
      });
    }

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

        return result;
      } catch (err: any) {
        metrics.increment("whatsapp.failure");

        logger.error("WhatsApp provider failure", {
          error: err.message,
          to: input.to,
        });

        throw new Error(`WhatsAppProvider failure: ${err.message}`);
      }
    });
  },
};
