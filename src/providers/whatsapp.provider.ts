// providers/whatsapp.provider.ts
import axios from "axios";
import { WhatsAppBreaker } from "../lib/circuit-breakers";
import { WhatsAppRetryQueue } from "../queues/messaging/whatsapp-retry.queue";
import { retryWithBackoff } from "../lib/retry";
import { logger } from "../lib/logger";
import { metrics } from "../lib/metrics";
import { DeliveryLog } from "../lib/delivery-log";
import { Correlation } from "../lib/correlation";

interface WhatsAppSendInput {
  to: string;
  template: string;
  variables: any;
  text?: string;
  subject?: string;
}

export const WhatsAppProvider = {
  async send(input: WhatsAppSendInput) {
    const ctx = Correlation.get();

    // ---------------------------------------------------------
    // Breaker OPEN → queue immediately
    // ---------------------------------------------------------
    if (WhatsAppBreaker.getState() === "OPEN") {
      logger.warn("WhatsApp breaker OPEN — queuing message", {
        ...ctx,
        to: input.to,
      });

      metrics.increment("whatsapp.fallback.queued");

      await DeliveryLog.write({
        channel: "whatsapp",
        status: "QUEUED",
        payload: input,
        metadata: { reason: "breaker-open" },
        ...ctx,
      });

      return WhatsAppRetryQueue.enqueue({
        ...input,
        traceId: ctx.traceId,
        requestId: ctx.requestId,
        spanId: ctx.spanId,
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

        logger.info("WhatsApp message sent", {
          ...ctx,
          to: input.to,
        });

        await DeliveryLog.write({
          channel: "whatsapp",
          status: "SENT",
          payload: input,
          metadata: { providerResponse: result },
          ...ctx,
        });

        return result;
      } catch (err: any) {
        metrics.increment("whatsapp.failure");

        logger.error("WhatsApp provider failure", {
          ...ctx,
          error: err.message,
          to: input.to,
        });

        await DeliveryLog.write({
          channel: "whatsapp",
          status: "FAILED",
          error: err.message,
          payload: input,
          ...ctx,
        });

        throw new Error(`WhatsAppProvider failure: ${err.message}`);
      }
    });
  },
};
