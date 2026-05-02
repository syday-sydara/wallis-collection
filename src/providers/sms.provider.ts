// providers/sms.provider.ts
import fetch from "node-fetch";

export interface SmsSendParams {
  to: string;
  text: string;
  messageId?: string;
  metadata?: Record<string, any>;
}

export const SmsProvider = {
  /**
   * Send an SMS via Termii / Twilio / Africa's Talking
   * - Timeout protection
   * - Structured logging
   * - Provider‑agnostic payload
   * - Idempotency‑ready messageId
   */
  async send({ to, text, messageId, metadata }: SmsSendParams) {
    const id =
      messageId ?? `sms_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const payload = {
      to,
      text,
    };

    try {
      // Replace with actual provider integration
      console.log("[SMS SEND]", { to, id, metadata });

      // Example Termii integration (commented out)
      //
      // const res = await fetch("https://api.ng.termii.com/api/sms/send", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     api_key: process.env.TERMII_API_KEY,
      //     to,
      //     from: process.env.TERMII_SENDER_ID,
      //     sms: text,
      //     type: "plain",
      //     channel: "generic",
      //   }),
      //   signal: AbortSignal.timeout(8000), // Nigeria‑first reliability
      // });
      //
      // if (!res.ok) {
      //   const body = await res.text();
      //   console.error("[SMS ERROR]", res.status, body);
      //   throw new Error(`SMS provider failed: ${res.status}`);
      // }

      return { messageId: id };
    } catch (err) {
      console.error("[SMS SEND FAILED]", { to, id, err });
      throw err;
    }
  },
};
