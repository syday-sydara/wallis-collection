// lib/whatsapp/buttons.ts

import { normalizePhoneForWhatsApp } from "@/lib/utils/formatters/phone";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";
import { EventSource } from "@/lib/events/types";

const TIMEOUT_MS = 8000;

export async function sendWhatsAppButtons(payload: {
  to: string;
  message: string;
  buttons: { id: string; title: string }[];
}) {
  const { to, message, buttons } = payload;

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

    return { ok: false, error: "missing_credentials" };
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

  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

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

      if (res.ok) {
        await emitSecurityEvent({
          kind: "security",
          type: "WHATSAPP_BUTTONS_SENT",
          message: `WhatsApp buttons sent to ${normalized}`,
          severity: "low",
          tags: ["whatsapp", "buttons_sent"],
          metadata: {
            to: normalized,
            buttonCount: buttons.length,
            attempt,
          },
          source: EventSource.WhatsAppAPI,
        });

        return { ok: true };
      }

      let errorBody: any;
      try {
        errorBody = await res.json();
      } catch {
        errorBody = await res.text();
      }

      const status = res.status;

      await emitSecurityEvent({
        kind: "security",
        type: "WHATSAPP_BUTTON_SEND_FAILED",
        message: `Failed to send WhatsApp buttons to ${normalized}`,
        severity: status >= 500 ? "high" : "medium",
        tags: ["whatsapp", "send_failed"],
        metadata: {
          to: normalized,
          status,
          error: errorBody,
          attempt,
        },
        source: EventSource.WhatsAppAPI,
      });

      if (status === 429) {
        return { ok: false, error: "rate_limited" };
      }

      if (status >= 500 && attempt === 1) {
        await new Promise((r) => setTimeout(r, 300 * attempt));
        continue;
      }

      if (attempt === 2) {
        await emitAlertEvent({
          kind: "alert",
          event: "ALERT_SYSTEM_FAILURE",
          severity: "high",
          metadata: {
            to: normalized,
            error: errorBody,
            status,
          },
          source: EventSource.WhatsAppAPI,
        });
      }

      return { ok: false, error: "api_error", status };
    } catch (err: any) {
      clearTimeout(timeout);

      await emitSecurityEvent({
        kind: "security",
        type: "WHATSAPP_BUTTON_NETWORK_ERROR",
        message: `Network error sending WhatsApp buttons to ${normalized}`,
        severity: "high",
        tags: ["whatsapp", "network_error"],
        metadata: {
          to: normalized,
          error: err?.message,
          attempt,
        },
        source: EventSource.WhatsAppAPI,
      });

      if (attempt === 2) {
        await emitAlertEvent({
          kind: "alert",
          event: "ALERT_SYSTEM_FAILURE",
          severity: "high",
          metadata: {
            to: normalized,
            error: err?.message,
          },
          source: EventSource.WhatsAppAPI,
        });

        return { ok: false, error: "network_error" };
      }

      await new Promise((r) => setTimeout(r, 300 * attempt));
    }
  }
}
