// providers/sms.provider.ts
import axios from "axios";
import { SmsBreaker } from "../lib/circuit-breakers";
import { normalizePhone } from "../utils/phone";
import { retryWithBackoff } from "../lib/retry";
import { SmsRetryQueue } from "../queues/messaging/sms-retry.queue";
import { logger } from "../lib/logger";
import { metrics } from "../lib/metrics";
import { DeliveryLog } from "../lib/delivery-log";

interface SmsSendInput {
  to: string;
  text: string;
  subject?: string; // needed for email fallback
}

export const SmsProvider = {
  async send(input: SmsSendInput) {
    const phone = normalizePhone(input.to);
    if (!phone) {
      logger.warn("SMS send failed: invalid phone", { to: input.to });

      await DeliveryLog.write({
        channel: "sms",
        status: "FAILED",
        error: "Invalid phone",
        payload: input,
      });

      throw new Error("Invalid phone");
    }

    // ---------------------------------------------------------
    // Breaker OPEN → queue immediately
    // ---------------------------------------------------------
    if (SmsBreaker.getState() === "OPEN") {
      logger.warn("SMS breaker OPEN — queuing message", { to: phone });
      metrics.increment("sms.fallback.queued");

      await DeliveryLog.write({
        channel: "sms",
        status: "QUEUED",
        payload: input,
        metadata: { reason: "breaker-open" },
      });

      return SmsRetryQueue.enqueue({
        to: phone,
        text: input.text,
        subject: input.subject ?? "Notification",
      });
    }

    // ---------------------------------------------------------
    // Normal execution path
    // ---------------------------------------------------------
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

        // AUDIT LOG: SENT
        await DeliveryLog.write({
          channel: "sms",
          status: "SENT",
          payload: input,
        });

        return result;
      } catch (err: any) {
        metrics.increment("sms.failure");

        logger.error("SMS provider failure", {
          error: err.message,
          to: phone,
        });

        // AUDIT LOG: FAILED
        await DeliveryLog.write({
          channel: "sms",
          status: "FAILED",
          error: err.message,
          payload: input,
        });

        throw new Error(`SmsProvider failure: ${err.message}`);
      }
    });
  },
};
