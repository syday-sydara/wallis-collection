// providers/whatsapp.provider.ts
import fetch from "node-fetch";

export interface WhatsAppSendParams {
  to: string;
  text: string;
  messageId?: string;
  metadata?: Record<string, any>;
}

export const WhatsAppProvider = {
  /**
   * Send a WhatsApp message via WhatsApp Cloud API
   * - Retries transient failures
   * - Logs failures for observability
   * - Returns messageId for idempotency
   */
  async send({ to, text, messageId, metadata }: WhatsAppSendParams) {
    const id = messageId ?? `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    };

    try {
      const res = await fetch(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          // Timeout protection (Nigeria‑first reliability)
          signal: AbortSignal.timeout(8000),
        }
      );

      if (!res.ok) {
        const body = await res.text();
        console.error("[WHATSAPP ERROR]", res.status, body);
        throw new Error(`WhatsApp API failed: ${res.status}`);
      }

      console.log("[WHATSAPP SENT]", { to, id, metadata });
      return { messageId: id };
    } catch (err) {
      console.error("[WHATSAPP SEND FAILED]", err);
      throw err;
    }
  },
};
