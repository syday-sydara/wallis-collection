// lib/whatsapp/media.ts

import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";
import { EventSource } from "@/lib/events/types";

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
    await emitSecurityEvent({
      kind: "security",
      type: "WHATSAPP_MISSING_CREDENTIALS",
      message: "WhatsApp API credentials missing",
      severity: "high",
      tags: ["whatsapp", "credentials_missing"],
      metadata: {},
      source: EventSource.WhatsAppAPI,
    });

    throw new Error("WhatsApp API credentials missing");
  }

  const normalized = normalizePhoneForWhatsApp(to);

  if (!normalized) {
    await emitSecurityEvent({
      kind: "security",
      type: "WHATSAPP_INVALID_NUMBER",
      message: `Invalid WhatsApp number: ${to}`,
      severity: "medium",
      tags: ["whatsapp", "invalid_number"],
      metadata: { raw: to },
      source: EventSource.WhatsAppAPI,
    });

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

    await emitSecurityEvent({
      kind: "security",
      type: "WHATSAPP_MEDIA_SEND_FAILED",
      message: `Failed to send WhatsApp ${type} to ${normalized}`,
      severity: "high",
      tags: ["whatsapp", "media_failed", `type:${type}`],
      metadata: {
        to: normalized,
        type,
        error,
      },
      source: EventSource.WhatsAppAPI,
    });

    await emitAlertEvent({
      kind: "alert",
      event: "ALERT_SYSTEM_FAILURE",
      severity: "high",
      metadata: {
        to: normalized,
        type,
        error,
      },
      source: EventSource.WhatsAppAPI,
    });

    return { ok: false, error };
  }

  await emitSecurityEvent({
    kind: "security",
    type: "WHATSAPP_MEDIA_SENT",
    message: `WhatsApp ${type} sent to ${normalized}`,
    severity: "low",
    tags: ["whatsapp", "media_sent", `type:${type}`],
    metadata: {
      to: normalized,
      type,
      caption,
      filename,
    },
    source: EventSource.WhatsAppAPI,
  });

  return { ok: true };
}

export function sendWhatsAppImage(to: string, mediaUrl: string, caption?: string) {
  return sendMediaMessage({ to, type: "image", mediaUrl, caption });
}

export function sendWhatsAppDocument(to: string, mediaUrl: string, filename: string, caption?: string) {
  return sendMediaMessage({ to, type: "document", mediaUrl, filename, caption });
}
