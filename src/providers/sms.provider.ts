// providers/sms.provider.ts
import axios from "axios";
import { SmsBreaker } from "../lib/circuit-breakers";
import { normalizePhone } from "../utils/phone";
import { retryWithBackoff } from "../lib/retry";
import { SmsRetryQueue } from "../queues/sms-retry.queue";   // <-- FIXED
import { logger } from "../lib/logger";
import { metrics } from "../lib/metrics";

interface SmsSendInput {
  to: string;
  text: string;
  subject?: string; // <-- needed for email fallback
}

export const SmsProvider = {
  async send(input: SmsSendInput) {
    const phone = normalizePhone(input.to);
    if (!phone) {
      logger.warn("SMS send failed: invalid phone", { to: input.to });
      throw new Error("Invalid phone");
    }

    // If breaker is OPEN → fallback immediately
    if (SmsBreaker.getState() === "OPEN") {
      logger.warn("SMS breaker OPEN — queuing message", { to: phone });
      metrics.increment("sms.fallback.queued");

      // IMPORTANT: include subject for email fallback
      return SmsRetryQueue.enqueue({
        to: phone,
        text: input.text,
        subject: input.subject ?? "Notification",
      });
    }

    return SmsBreaker.exec(async () => {
      const start = Date.now();

      try {
        const result = await retryWithBackoff(async () => {
          const res = await axios.post(
            "https://sms-provider/api/send",
            {
              to: phone,
              text: input.text,
            },
            {
              timeout: 5000,
              validateStatus: () => true,
            }
          );

          if (res.status >= 400) {
            throw new Error(
              `SMS HTTP ${res.status}: ${JSON.stringify(res.data)}`
            );
          }

          if (res.data?.error) {
            throw new Error(
              `SMS logical error: ${JSON.stringify(res.data.error)}`
            );
          }

          return res.data;
        });

        metrics.observe("sms.latency", Date.now() - start);
        metrics.increment("sms.success");

        return result;
      } catch (err: any) {
        metrics.increment("sms.failure");

        logger.error("SMS provider failure", {
          error: err.message,
          to: phone,
        });

        throw new Error(`SmsProvider failure: ${err.message}`);
      }
    });
  },
};
