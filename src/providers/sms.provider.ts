// providers/sms.provider.ts
import axios from "axios";
import { SmsBreaker } from "../lib/circuit-breakers";
import { normalizePhone } from "../utils/phone";
import { retryWithBackoff } from "../lib/retry";
import { SmsRetryQueue } from "../queues/messaging/sms-retry.queue";
import { logger } from "../lib/logger";
import { metrics } from "../lib/metrics";
import { DeliveryLog } from "../lib/delivery-log";
import { Correlation } from "../lib/correlation";

interface SmsSendInput {
  to: string;
  text: string;
  subject?: string;
}

export const SmsProvider = {
  async send(input: SmsSendInput) {
    const ctx = Correlation.get();

    const phone = normalizePhone(input.to);
    if (!phone) {
      logger.warn("SMS send failed: invalid phone", {
        ...ctx,
        to: input.to,
      });

      await DeliveryLog.write({
        channel: "sms",
        status: "FAILED",
        error: "Invalid phone",
        payload: input,
        ...ctx,
      });

      throw new Error("Invalid phone");
    }

    // ---------------------------------------------------------
    // Breaker OPEN → queue immediately
    // ---------------------------------------------------------
    if (SmsBreaker.getState() === "OPEN") {
      logger.warn("SMS breaker OPEN — queuing message", {
        ...ctx,
        to: phone,
      });

      metrics.increment("sms.fallback.queued");

      await DeliveryLog.write({
        channel: "sms",
        status: "QUEUED",
        payload: input,
        metadata: { reason: "breaker-open" },
        ...ctx,
      });

      return SmsRetryQueue.enqueue({
        to: phone,
        text: input.text,
        subject: input.subject ?? "Notification",
        traceId: ctx.traceId,
        requestId: ctx.requestId,
        spanId: ctx.spanId,
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

        logger.info("SMS message sent", {
          ...ctx,
          to: phone,
        });

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
          error: err.message,
          to: phone,
        });

        await DeliveryLog.write({
          channel: "sms",
          status: "FAILED",
          error: err.message,
          payload: input,
          ...ctx,
        });

        throw new Error(`SmsProvider failure: ${err.message}`);
      }
    });
  },
};
