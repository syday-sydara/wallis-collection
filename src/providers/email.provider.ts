// providers/email.provider.ts
import fetch from "node-fetch";

export interface EmailSendParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  messageId?: string;
  metadata?: Record<string, any>;
}

export const EmailProvider = {
  /**
   * Send an email via SendGrid / SES / Mailgun / Resend / SMTP
   * - Timeout protection
   * - Structured logging
   * - Provider‑agnostic payload
   * - Idempotency‑ready messageId
   */
  async send({ to, subject, html, text, messageId, metadata }: EmailSendParams) {
    const id =
      messageId ?? `email_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const payload = {
      to,
      subject,
      html,
      text,
    };

    try {
      // Replace this with your actual provider integration
      console.log("[EMAIL SEND]", { to, subject, id, metadata });

      // Example provider call (commented out)
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
      //   signal: AbortSignal.timeout(8000), // Nigeria‑first reliability
      // });
      //
      // if (!res.ok) {
      //   const body = await res.text();
      //   console.error("[EMAIL ERROR]", res.status, body);
      //   throw new Error(`Email provider failed: ${res.status}`);
      // }

      return { messageId: id };
    } catch (err) {
      console.error("[EMAIL SEND FAILED]", { to, subject, id, err });
      throw err;
    }
  },
};
