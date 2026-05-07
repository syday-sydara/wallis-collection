// providers/whatsapp.provider.ts
import axios from "axios";
import { WhatsAppBreaker } from "@/lib/circuit-breakers";
import { retryWithBackoff } from "@/lib/retry";
import { logger } from "@/lib/logger";
import { metrics } from "@/lib/metrics";
import { DeliveryLog } from "@/lib/delivery-log";
import { Correlation } from "@/lib/correlation";

interface WhatsAppSendInput {
  messageId: string;
  to: string;
  template: string;
  variables: Record<string, any>;
}

export const WhatsAppProvider = {
  breaker: WhatsAppBreaker,

  async send(input: WhatsAppSendInput) {
    const ctx = Correlation.get();

    if (WhatsAppBreaker.isOpen()) {
      throw new Error("WHATSAPP_BREAKER_OPEN");
    }

    return WhatsAppBreaker.exec(async () => {
      const start = Date.now();

      try {
        const result = await retryWithBackoff(async () => {
          const res = await axios.post(
            "https://graph.facebook.com/v18.0/WHATSAPP_ENDPOINT",
            {
              messaging_product: "whatsapp",
              to: input.to,
              type: "template",
              template: {
                name: input.template,
                language: { code: "en_US" },
                components: input.variables,
              },
            },
            {
              timeout: 5000,
              validateStatus: () => true,
            }
          );

          if (res.status >= 400) {
            throw new Error(`WHATSAPP_HTTP_${res.status}`);
          }

          if (res.data?.error) {
            throw new Error(`WHATSAPP_LOGICAL_${res.data.error.code}`);
          }

          return res.data;
        });

        metrics.observe("whatsapp.latency", Date.now() - start);
        metrics.increment("whatsapp.success");

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
          to: input.to,
          error: err.message,
        });

        await DeliveryLog.write({
          channel: "whatsapp",
          status: "FAILED",
          error: err.message,
          payload: input,
          ...ctx,
        });

        throw err;
      }
    });
  },
};
