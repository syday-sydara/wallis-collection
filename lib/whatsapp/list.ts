// lib/whatsapp/list.ts

import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";

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

  /* -------------------------------------------------- */
  /* Send request                                        */
  /* -------------------------------------------------- */
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyPayload),
  });

  /* -------------------------------------------------- */
  /* Handle failure                                      */
  /* -------------------------------------------------- */
  if (!res.ok) {
    const error = await res.text();

    await emitSecurityEvent({
      type: "WHATSAPP_LIST_SEND_FAILED",
      message: `Failed to send WhatsApp list to ${normalized}`,
      severity: "high",
      context: "whatsapp",
      operation: "send",
      category: "whatsapp",
      tags: ["whatsapp", "list_failed"],
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
    type: "WHATSAPP_LIST_SENT",
    message: `WhatsApp list sent to ${normalized}`,
    severity: "low",
    context: "whatsapp",
    operation: "send",
    category: "whatsapp",
    tags: ["whatsapp", "list_sent"],
    metadata: {
      to: normalized,
      sectionCount: sections.length,
      rowCount: sections.reduce((acc, s) => acc + s.rows.length, 0),
    },
    source: "whatsapp_api",
  });

  return { ok: true };
}
