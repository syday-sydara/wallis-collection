// lib/whatsapp/list.ts
import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { logEvent } from "../auth/logger";

export async function sendWhatsAppList(payload: {
  to: string;
  header?: string;
  body: string;
  footer?: string;
  buttonText: string;
  sections: {
    title: string;
    rows: { id: string; title: string; description?: string }[];
  }[];
}) {
  const { to, header, body, footer, buttonText, sections } = payload;

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

  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

  const bodyPayload: any = {
    messaging_product: "whatsapp",
    to: normalized,
    type: "interactive",
    interactive: {
      type: "list",
      body: { text: body },
      action: {
        button: buttonText,
        sections: sections.map((section) => ({
          title: section.title,
          rows: section.rows.map((row) => ({
            id: row.id,
            title: row.title,
            description: row.description,
          })),
        })),
      },
    },
  };

  if (header) {
    bodyPayload.interactive.header = { type: "text", text: header };
  }

  if (footer) {
    bodyPayload.interactive.footer = { text: footer };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!res.ok) {
    const error = await res.text();
    logEvent("whatsapp_list_failed", { to: normalized, error }, "error");
    return { ok: false, error };
  }

  logEvent("whatsapp_list_sent", { to: normalized });
  return { ok: true };
}
