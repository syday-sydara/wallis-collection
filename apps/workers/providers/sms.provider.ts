// providers/sms.provider.ts
import axios from "axios";
import { SmsBreaker } from "../lib/circuit-breakers";
import { retryWithBackoff } from "../lib/retry";
import { logger } from "../lib/logger";
import { metrics } from "../lib/metrics";
import { DeliveryLog } from "../lib/delivery-log";
import { Correlation } from "../lib/correlation";

interface SmsSendInput {
  messageId: string;
  to: string;
  text: string;
}

export const SmsProvider = {
  breaker: SmsBreaker,

  async send(input: SmsSendInput) {
    const ctx = Correlation.get();

    if (SmsBreaker.isOpen()) {
      throw new Error("SMS_BREAKER_OPEN");
    }

    return SmsBreaker.exec(async () => {
      const start = Date.now();

      try {
        const result = await retryWithBackoff(async () => {
          const res = await axios.post(
            "https://api.termii.com/api/sms/send",
            {
              to: input.to,
              sms: input.text,
              api_key: process.env.TERMII_API_KEY,
              type: "plain",
              channel: "generic",
            },
            {
              timeout: 5000,
              validateStatus: () => true,
            }
          );

          if (res.status >= 400) {
            throw new Error(`SMS_HTTP_${res.status}`);
          }

          if (res.data?.message === "fail") {
            throw new Error("SMS_PROVIDER_FAIL");
          }

          return res.data;
        });

        metrics.observe("sms.latency", Date.now() - start);
        metrics.increment("sms.success");

        await DeliveryLog.write({
          channel: "sms",
          status: "SENT",
          payload: input,
          metadata: { providerResponse: result },
          ...ctx,
        });

        return result;
      } catch (err: any) {
        metrics.increment("sms.failure");

        logger.error("SMS provider failure", {
          ...ctx,
          to: input.to,
          error: err.message,
        });

        await DeliveryLog.write({
          channel: "sms",
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
