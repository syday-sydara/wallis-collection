// lib/whatsapp/buttons.ts

import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";

const TIMEOUT_MS = 8000;

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

    return { ok: false, error: "missing_credentials" };
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
  /* Retry logic (2 attempts, exponential backoff)       */
  /* -------------------------------------------------- */
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

      /* -------------------------------------------------- */
      /* Success                                             */
      /* -------------------------------------------------- */
      if (res.ok) {
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
            attempt,
          },
          source: "whatsapp_api",
        });

        return { ok: true };
      }

      /* -------------------------------------------------- */
      /* API returned an error                               */
      /* -------------------------------------------------- */
      let errorBody: any;
      try {
        errorBody = await res.json();
      } catch {
        errorBody = await res.text();
      }

      const status = res.status;

      await emitSecurityEvent({
        type: "WHATSAPP_BUTTON_SEND_FAILED",
        message: `Failed to send WhatsApp buttons to ${normalized}`,
        severity: status >= 500 ? "high" : "medium",
        context: "whatsapp",
        operation: "send",
        category: "whatsapp",
        tags: ["whatsapp", "send_failed"],
        metadata: {
          to: normalized,
          status,
          error: errorBody,
          attempt,
        },
        source: "whatsapp_api",
      });

      if (status === 429) {
        return { ok: false, error: "rate_limited" };
      }

      // Retry only on server errors
      if (status >= 500 && attempt === 1) {
        await new Promise((r) => setTimeout(r, 300 * attempt));
        continue;
      }

      // Hard failure
      if (attempt === 2) {
        await emitAlertEvent({
          type: "WHATSAPP_DELIVERY_FAILURE",
          metadata: {
            to: normalized,
            error: errorBody,
            status,
          },
        });
      }

      return { ok: false, error: "api_error", status };
    } catch (err: any) {
      clearTimeout(timeout);

      await emitSecurityEvent({
        type: "WHATSAPP_BUTTON_NETWORK_ERROR",
        message: `Network error sending WhatsApp buttons to ${normalized}`,
        severity: "high",
        context: "whatsapp",
        operation: "send",
        category: "whatsapp",
        tags: ["whatsapp", "network_error"],
        metadata: {
          to: normalized,
          error: err?.message,
          attempt,
        },
        source: "whatsapp_api",
      });

      if (attempt === 2) {
        await emitAlertEvent({
          type: "WHATSAPP_DELIVERY_FAILURE",
          metadata: {
            to: normalized,
            error: err?.message,
          },
        });

        return { ok: false, error: "network_error" };
      }

      await new Promise((r) => setTimeout(r, 300 * attempt));
    }
  }
}
