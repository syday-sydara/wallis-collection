// lib/whatsapp/buttons.ts

import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";
import { maskEmail } from "@/lib/security/normalize";

export async function sendWhatsAppButtons(payload: {
  to: string;
  message: string;
  buttons: { id: string; title: string }[];
}) {
  const { to, message, buttons } = payload;

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
      type: "WHATSAPP_BUTTON_SEND_FAILED",
      message: `Failed to send WhatsApp buttons to ${normalized}`,
      severity: "high",
      context: "whatsapp",
      operation: "send",
      category: "whatsapp",
      tags: ["whatsapp", "send_failed"],
      metadata: {
        to: normalized,
        error,
      },
      source: "whatsapp_api",
    });

    await emitAlertEvent({
      type: "WHATSAPP_DELIVERY_FAILURE",
      metadata: {
        to: normalized,
        error,
      },
    });

    return { ok: false, error };
  }

  /* -------------------------------------------------- */
  /* Success event                                       */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "WHATSAPP_BUTTONS_SENT",
    message: `WhatsApp buttons sent to ${normalized}`,
    severity: "low",
    context: "whatsapp",
    operation: "send",
    category: "whatsapp",
    tags: ["whatsapp", "buttons_sent"],
    metadata: {
      to: normalized,
      buttonCount: buttons.length,
    },
    source: "whatsapp_api",
  });

  return { ok: true };
}
