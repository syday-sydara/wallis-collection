// lib/whatsapp/media.ts
import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { logEvent } from "../auth/logger";

const BASE_URL = "https://graph.facebook.com/v18.0";

async function sendMediaMessage(payload: {
  to: string;
  type: "image" | "document";
  mediaUrl: string;
  caption?: string;
  filename?: string;
}) {
  const { to, type, mediaUrl, caption, filename } = payload;

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

  const url = `${BASE_URL}/${phoneId}/messages`;

  const body: any = {
    messaging_product: "whatsapp",
    to: normalized,
    type,
    [type]: {
      link: mediaUrl,
    },
  };

  if (caption) body[type].caption = caption;
  if (filename && type === "document") body[type].filename = filename;

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
    logEvent("whatsapp_media_failed", { to: normalized, error }, "error");
    return { ok: false, error };
  }

  logEvent("whatsapp_media_sent", { to: normalized, type });
  return { ok: true };
}

export function sendWhatsAppImage(to: string, mediaUrl: string, caption?: string) {
  return sendMediaMessage({ to, type: "image", mediaUrl, caption });
}

export function sendWhatsAppDocument(to: string, mediaUrl: string, filename: string, caption?: string) {
  return sendMediaMessage({ to, type: "document", mediaUrl, filename, caption });
}
