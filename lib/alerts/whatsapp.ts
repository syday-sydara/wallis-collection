// lib/alerts/whatsapp.ts
import { logEvent } from "@/lib/logger";

export async function sendWhatsAppAlert(payload: {
  to: string;
  template: string;
  variables?: string[];
  severity?: "low" | "medium" | "high";
}) {
  const { to, template, variables = [], severity = "low" } = payload;

  const token = process.env.WHATSAPP_ACCESS_TOKEN!;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID!;

  // Basic phone validation
  if (!/^\d{10,15}$/.test(to)) {
    logEvent("whatsapp_invalid_number", { to, template, severity }, "warn");
    return { ok: false, error: "invalid_number" };
  }

  const safeVars = variables.filter((v) => typeof v === "string");

  const body = {
    messaging_product: "whatsapp",
    to,
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

      if (!res.ok) {
        let errorBody: any;
        try {
          errorBody = await res.json();
        } catch {
          errorBody = await res.text();
        }

        logEvent(
          "whatsapp_alert_failed",
          {
            to,
            template,
            severity,
            status: res.status,
            error: errorBody,
            attempt,
          },
          "warn"
        );

        if (res.status >= 500 && attempt === 1) {
          await new Promise((r) => setTimeout(r, 300 * attempt));
          continue;
        }

        return { ok: false, error: "api_error" };
      }

      logEvent("whatsapp_alert_sent", { to, template, severity });
      return { ok: true };
    } catch (err: any) {
      clearTimeout(timeout);

      logEvent(
        "whatsapp_alert_error",
        {
          to,
          template,
          severity,
          message: err?.message,
          attempt,
        },
        "error"
      );

      if (attempt === 2) return { ok: false, error: "network_error" };

      await new Promise((r) => setTimeout(r, 300 * attempt));
    }
  }
}