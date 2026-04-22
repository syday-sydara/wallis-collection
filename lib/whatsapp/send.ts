// lib/whatsapp/send.ts

import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";

export async function sendWhatsAppMessage(to: string, message: string) {
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

  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to: normalized,
    type: "text",
    text: { body: message },
  };

  /* -------------------------------------------------- */
  /* Retry logic (2 attempts)                            */
  /* -------------------------------------------------- */
  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

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
      /* API returned an error                               */
      /* -------------------------------------------------- */
      if (!res.ok) {
        let errorBody: any;
        try {
          errorBody = await res.json();
        } catch {
          errorBody = await res.text();
        }

        await emitSecurityEvent({
          type: "WHATSAPP_SEND_FAILED",
          message: `WhatsApp send failed to ${normalized}`,
          severity: res.status >= 500 ? "high" : "medium",
          context: "whatsapp",
          operation: "send",
          category: "whatsapp",
          tags: ["whatsapp", "send_failed"],
          metadata: {
            to: normalized,
            message,
            status: res.status,
            error: errorBody,
            attempt,
          },
          source: "whatsapp_api",
        });

        // Retry only on server errors
        if (res.status >= 500 && attempt === 1) {
          await new Promise((r) => setTimeout(r, 300 * attempt));
          continue;
        }

        // Hard alert for persistent failure
        if (attempt === 2) {
          await emitAlertEvent({
            type: "WHATSAPP_DELIVERY_FAILURE",
            metadata: {
              to: normalized,
              status: res.status,
              error: errorBody,
            },
          });
        }

        return { ok: false, error: "api_error", status: res.status };
      }

      /* -------------------------------------------------- */
      /* Success                                             */
      /* -------------------------------------------------- */
      await emitSecurityEvent({
        type: "WHATSAPP_MESSAGE_SENT",
        message: `WhatsApp message sent to ${normalized}`,
        severity: "low",
        context: "whatsapp",
        operation: "send",
        category: "whatsapp",
        tags: ["whatsapp", "message_sent"],
        metadata: {
          to: normalized,
          attempt,
        },
        source: "whatsapp_api",
      });

      return { ok: true };
    } catch (err: any) {
      clearTimeout(timeout);

      await emitSecurityEvent({
        type: "WHATSAPP_SEND_ERROR",
        message: `Network error sending WhatsApp message to ${normalized}`,
        severity: "high",
        context: "whatsapp",
        operation: "send",
        category: "whatsapp",
        tags: ["whatsapp", "network_error"],
        metadata: {
          to: normalized,
          message,
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
