// lib/whatsapp/media.ts

import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";

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

  /* -------------------------------------------------- */
  /* Missing credentials                                 */
  /* -------------------------------------------------- */
  if (!token || !phoneId) {
    await emitSecurityEvent({
      type: "WHATSAPP_MISSING_CREDENTIALS",
      message: "WhatsApp API credentials missing",
      severity: "high",
      context: "whatsapp",
      operation: "access",
      category: "whatsapp",
      tags: ["whatsapp", "credentials_missing"],
      metadata: {},
      source: "whatsapp_api",
    });

    throw new Error("WhatsApp API credentials missing");
  }

  /* -------------------------------------------------- */
  /* Normalize phone number                              */
  /* -------------------------------------------------- */
  const normalized = normalizePhoneForWhatsApp(to);

  if (!normalized) {
    await emitSecurityEvent({
      type: "WHATSAPP_INVALID_NUMBER",
      message: `Invalid WhatsApp number: ${to}`,
      severity: "medium",
      context: "whatsapp",
      operation: "validate",
      category: "whatsapp",
      tags: ["whatsapp", "invalid_number"],
      metadata: { raw: to },
      source: "whatsapp_api",
    });

    return { ok: false, error: "invalid_number" };
  }

  /* -------------------------------------------------- */
  /* Build WhatsApp API payload                          */
  /* -------------------------------------------------- */
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

  /* -------------------------------------------------- */
  /* Send request                                        */
  /* -------------------------------------------------- */
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  /* -------------------------------------------------- */
  /* Handle failure                                      */
  /* -------------------------------------------------- */
  if (!res.ok) {
    const error = await res.text();

    await emitSecurityEvent({
      type: "WHATSAPP_MEDIA_SEND_FAILED",
      message: `Failed to send WhatsApp ${type} to ${normalized}`,
      severity: "high",
      context: "whatsapp",
      operation: "send",
      category: "whatsapp",
      tags: ["whatsapp", "media_failed", `type:${type}`],
      metadata: {
        to: normalized,
        type,
        error,
      },
      source: "whatsapp_api",
    });

    await emitAlertEvent({
      type: "WHATSAPP_DELIVERY_FAILURE",
      metadata: {
        to: normalized,
        type,
        error,
      },
    });

    return { ok: false, error };
  }

  /* -------------------------------------------------- */
  /* Success event                                       */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "WHATSAPP_MEDIA_SENT",
    message: `WhatsApp ${type} sent to ${normalized}`,
    severity: "low",
    context: "whatsapp",
    operation: "send",
    category: "whatsapp",
    tags: ["whatsapp", "media_sent", `type:${type}`],
    metadata: {
      to: normalized,
      type,
      caption,
      filename,
    },
    source: "whatsapp_api",
  });

  return { ok: true };
}

export function sendWhatsAppImage(to: string, mediaUrl: string, caption?: string) {
  return sendMediaMessage({ to, type: "image", mediaUrl, caption });
}

export function sendWhatsAppDocument(to: string, mediaUrl: string, filename: string, caption?: string) {
  return sendMediaMessage({ to, type: "document", mediaUrl, filename, caption });
}
