// lib/whatsapp/list.ts

import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";
import { EventSource } from "@/lib/events/types";

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

    await emitSecurityEvent({
      kind: "security",
      type: "WHATSAPP_LIST_SEND_FAILED",
      message: `Failed to send WhatsApp list to ${normalized}`,
      severity: "high",
      tags: ["whatsapp", "list_failed"],
      metadata: {
        to: normalized,
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
        error,
      },
      source: EventSource.WhatsAppAPI,
    });

    return { ok: false, error };
  }

  await emitSecurityEvent({
    kind: "security",
    type: "WHATSAPP_LIST_SENT",
    message: `WhatsApp list sent to ${normalized}`,
    severity: "low",
    tags: ["whatsapp", "list_sent"],
    metadata: {
      to: normalized,
      sectionCount: sections.length,
      rowCount: sections.reduce((acc, s) => acc + s.rows.length, 0),
    },
    source: EventSource.WhatsAppAPI,
  });

  return { ok: true };
}
