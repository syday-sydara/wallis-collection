// providers/email.provider.ts
import axios from "axios";
import { EmailBreaker } from "@/lib/circuit-breakers";
import { retryWithBackoff } from "@/lib/retry";
import { logger } from "@/lib/logger";
import { metrics } from "@/lib/metrics";
import { DeliveryLog } from "@/lib/delivery-log";
import { Correlation } from "@/lib/correlation";

interface EmailSendInput {
  messageId: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

export const EmailProvider = {
  breaker: EmailBreaker,

  async send(input: EmailSendInput) {
    const ctx = Correlation.get();

    if (EmailBreaker.isOpen()) {
      throw new Error("EMAIL_BREAKER_OPEN");
    }

    return EmailBreaker.exec(async () => {
      const start = Date.now();

      try {
        const result = await retryWithBackoff(async () => {
          const res = await axios.post(
            "https://api.sendgrid.com/v3/mail/send",
            {
              personalizations: [{ to: [{ email: input.to }] }],
              from: { email: process.env.SENDGRID_FROM! },
              subject: input.subject,
              content: [
                { type: "text/plain", value: input.text },
                { type: "text/html", value: input.html },
              ],
            },
            {
              timeout: 5000,
              headers: {
                Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
              },
              validateStatus: () => true,
            }
          );

          if (res.status >= 400) {
            throw new Error(`EMAIL_HTTP_${res.status}`);
          }

          return res.data ?? { ok: true };
        });

        metrics.observe("email.latency", Date.now() - start);
        metrics.increment("email.success");

        await DeliveryLog.write({
          channel: "email",
          status: "SENT",
          payload: input,
          metadata: { providerResponse: result },
          ...ctx,
        });

        return result;
      } catch (err: any) {
        metrics.increment("email.failure");

        logger.error("Email provider failure", {
          ...ctx,
          to: input.to,
          error: err.message,
        });

        await DeliveryLog.write({
          channel: "email",
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
