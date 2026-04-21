import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { logEvent } from "../auth/logger";

export async function sendWhatsAppButtons(payload: {
  to: string;
  message: string;
  buttons: { id: string; title: string }[];
}) {
  const { to, message, buttons } = payload;

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    logEvent("whatsapp_missing_credentials", {}, "error");
    throw new Error("WhatsApp API credentials missing");
  }

  const normalized = normalizePhoneForWhatsApp(to);
  if (!normalized) {
    logEvent("whatsapp_invalid_number", { to }, "warn");
    return { ok: false, error: "invalid_number" };
  }

  const body = {
    messaging_product: "whatsapp",
    to: normalized,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: message },
      action: {
        buttons: buttons.map((b) => ({
          type: "reply",
          reply: { id: b.id, title: b.title },
        })),
      },
    },
  };

  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    logEvent("whatsapp_buttons_failed", { to, error }, "error");
    return { ok: false, error };
  }

  logEvent("whatsapp_buttons_sent", { to });
  return { ok: true };
}
