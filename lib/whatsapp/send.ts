// lib/whatsapp/send.ts
import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { logEvent } from "../auth/logger";

export async function sendWhatsAppMessage(to: string, message: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    logEvent("whatsapp_missing_credentials", {}, "error");
    throw new Error("WhatsApp API credentials missing");
  }

  // Normalize phone number
  const normalized = normalizePhoneForWhatsApp(to);
  if (!normalized) {
    logEvent("whatsapp_invalid_number", { to }, "warn");
    return { ok: false, error: "invalid_number" };
  }

  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to: normalized,
    type: "text",
    text: { body: message },
  };

  // Retry logic (2 attempts)
  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        let errorBody: any;
        try {
          errorBody = await res.json();
        } catch {
          errorBody = await res.text();
        }

        logEvent(
          "whatsapp_send_failed",
          { to: normalized, message, status: res.status, error: errorBody, attempt },
          "warn"
        );

        // Retry only on server errors
        if (res.status >= 500 && attempt === 1) {
          await new Promise((r) => setTimeout(r, 300 * attempt));
          continue;
        }

        return { ok: false, error: "api_error", status: res.status };
      }

      logEvent("whatsapp_message_sent", { to: normalized });
      return { ok: true };
    } catch (err: any) {
      clearTimeout(timeout);

      logEvent(
        "whatsapp_send_error",
        { to: normalized, message, error: err?.message, attempt },
        "error"
      );

      if (attempt === 2) {
        return { ok: false, error: "network_error" };
      }

      await new Promise((r) => setTimeout(r, 300 * attempt));
    }
  }
}
