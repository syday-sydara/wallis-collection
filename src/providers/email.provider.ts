// providers/email.provider.ts
import { logger } from "../lib/logger";
import { metrics } from "../lib/metrics";
import { EmailBreaker } from "../lib/circuit-breakers";
import { retryWithBackoff } from "../lib/retry";
import { DeliveryLog } from "../lib/delivery-log";
import { Correlation } from "../lib/correlation";

export interface EmailSendParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  messageId?: string;
  metadata?: Record<string, any>;
}

export const EmailProvider = {
  async send(params: EmailSendParams) {
    const ctx = Correlation.get();

    const { to, subject, text, messageId, metadata } = params;

    const id =
      messageId ??
      `email_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    return EmailBreaker.exec(async () => {
      const start = Date.now();

      try {
        const result = await retryWithBackoff(async () => {
          logger.info("[EMAIL SEND]", {
            ...ctx,
            to,
            subject,
            id,
            metadata,
          });

          // TODO: Replace with actual provider integration
          return { messageId: id };
        });

        metrics.increment("email.success");
        metrics.observe("email.latency", Date.now() - start);

        await DeliveryLog.write({
          channel: "email",
          status: "SENT",
          messageId: id,
          payload: { to, subject, metadata },
          metadata: { providerResponse: result },
          ...ctx,
        });

        return result;
      } catch (err: any) {
        metrics.increment("email.failure");

        logger.error("[EMAIL SEND FAILED]", {
          ...ctx,
          to,
          subject,
          id,
          error: err.message,
        });

        await DeliveryLog.write({
          channel: "email",
          status: "FAILED",
          messageId: id,
          error: err.message,
          payload: { to, subject, metadata },
          ...ctx,
        });

        throw new Error(`EmailProvider failure: ${err.message}`);
      }
    });
  },
};
