// lib/alerts/whatsapp.ts

import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";

export async function sendWhatsAppAlert(payload: {
  to: string;
  template: string;
  variables?: string[];
  severity?: "low" | "medium" | "high";
}) {
  const { to, template, variables = [], severity = "low" } = payload;

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
      metadata: { raw: to, template, severity },
      source: "whatsapp_api",
    });

    return { ok: false, error: "invalid_number" };
  }

  /* -------------------------------------------------- */
  /* Validate template name                              */
  /* -------------------------------------------------- */
  if (!/^[a-z0-9_]+$/.test(template)) {
    await emitSecurityEvent({
      type: "WHATSAPP_INVALID_TEMPLATE",
      message: `Invalid WhatsApp template name: ${template}`,
      severity: "medium",
      context: "whatsapp",
      operation: "validate",
      category: "whatsapp",
      tags: ["whatsapp", "invalid_template"],
      metadata: { template },
      source: "whatsapp_api",
    });

    return { ok: false, error: "invalid_template" };
  }

  const safeVars = variables.filter((v) => typeof v === "string");

  const body = {
    messaging_product: "whatsapp",
    to: normalized,
    type: "template",
    template: {
      name: template,
      language: { code: "en_US" },
      components: safeVars.length
        ? [
            {
              type: "body",
              parameters: safeVars.map((v) => ({
                type: "text",
                text: v,
              })),
            },
          ]
        : [],
    },
  };

  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

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

        const status = res.status;

        await emitSecurityEvent({
          type: "WHATSAPP_ALERT_FAILED",
          message: `WhatsApp alert failed to ${normalized}`,
          severity: status >= 500 ? "high" : "medium",
          context: "whatsapp",
          operation: "send",
          category: "whatsapp",
          tags: ["whatsapp", "alert_failed"],
          metadata: {
            to: normalized,
            template,
            severity,
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

        // Hard alert for persistent failure
        if (attempt === 2) {
          await emitAlertEvent({
            type: "WHATSAPP_DELIVERY_FAILURE",
            metadata: {
              to: normalized,
              template,
              severity,
              status,
              error: errorBody,
            },
          });
        }

        return { ok: false, error: "api_error", status };
      }

      /* -------------------------------------------------- */
      /* Success                                             */
      /* -------------------------------------------------- */
      await emitSecurityEvent({
        type: "WHATSAPP_ALERT_SENT",
        message: `WhatsApp alert sent to ${normalized}`,
        severity,
        context: "whatsapp",
        operation: "send",
        category: "whatsapp",
        tags: ["whatsapp", "alert_sent"],
        metadata: {
          to: normalized,
          template,
          severity,
          attempt,
        },
        source: "whatsapp_api",
      });

      return { ok: true };
    } catch (err: any) {
      clearTimeout(timeout);

      await emitSecurityEvent({
        type: "WHATSAPP_ALERT_ERROR",
        message: `Network error sending WhatsApp alert to ${normalized}`,
        severity: "high",
        context: "whatsapp",
        operation: "send",
        category: "whatsapp",
        tags: ["whatsapp", "alert_error"],
        metadata: {
          to: normalized,
          template,
          severity,
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
            template,
            severity,
            error: err?.message,
          },
        });

        return { ok: false, error: "network_error" };
      }

      await new Promise((r) => setTimeout(r, 300 * attempt));
    }
  }
}
