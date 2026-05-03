// providers/email.provider.ts
import { logger } from "../lib/logger";
import { metrics } from "../lib/metrics";
import { EmailBreaker } from "../lib/circuit-breakers";
import { retryWithBackoff } from "../lib/retry";

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
    const { to, subject, html, text, messageId, metadata } = params;

    const id =
      messageId ??
      `email_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    return EmailBreaker.exec(async () => {
      const start = Date.now();

      try {
        const result = await retryWithBackoff(async () => {
          // Replace with your actual provider integration
          logger.info("[EMAIL SEND]", { to, subject, id, metadata });

          // Example provider call:
          //
          // const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
          //   method: "POST",
          //   headers: {
          //     Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          //     "Content-Type": "application/json",
          //   },
          //   body: JSON.stringify({
          //     personalizations: [{ to: [{ email: to }] }],
          //     from: { email: process.env.EMAIL_FROM },
          //     subject,
          //     content: [
          //       { type: "text/plain", value: text },
          //       { type: "text/html", value: html },
          //     ],
          //   }),
          //   signal: AbortSignal.timeout(8000),
          // });
          //
          // if (!res.ok) {
          //   const body = await res.text();
          //   throw new Error(`Email provider failed: ${res.status} ${body}`);
          // }

          return { messageId: id };
        });

        metrics.increment("email.success");
        metrics.observe("email.latency", Date.now() - start);

        return result;
      } catch (err: any) {
        metrics.increment("email.failure");

        logger.error("[EMAIL SEND FAILED]", {
          to,
          subject,
          id,
          error: err.message,
        });

        throw new Error(`EmailProvider failure: ${err.message}`);
      }
    });
  },
};
