// lib/messaging/sendWhatsAppOrder.ts
import { normalizePhoneForWhatsApp } from "@/lib/utils/formatters/phone";
import { generateWhatsAppMessage } from "@/lib/utils/whatsapp";
import { sendOrderEmail } from "@/lib/email/sendOrderEmail";
import { logEvent } from "@/lib/auth/logger";
import type { CartItem } from "@/lib/cart/types";

type SendWhatsAppOrderParams = {
  items: CartItem[];
  total: number;
  fullName?: string;
  customerPhone: string;
  customerEmail: string; // needed for fallback
};

export async function sendWhatsAppOrder({
  items,
  total,
  fullName,
  customerPhone,
  customerEmail,
}: SendWhatsAppOrderParams) {
  // 1. Normalize phone number
  const phone = normalizePhoneForWhatsApp(customerPhone);

  // 2. Generate message text
  const message = generateWhatsAppMessage(items, total, fullName);

  // 3. WhatsApp Cloud API credentials
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  const whatsappEnabled = Boolean(token && phoneId && phone);

  // ============================================================
  // TRY WHATSAPP FIRST
  // ============================================================
  if (whatsappEnabled) {
    const payload = {
      messaging_product: "whatsapp",
      to: phone!,
      type: "text",
      text: { body: message },
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
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (res.ok) {
          logEvent("whatsapp_order_sent", { phone }, "info");
          return { ok: true, channel: "whatsapp" };
        }

        const errorBody = await res.text();

        logEvent(
          "whatsapp_order_failed",
          { phone, status: res.status, error: errorBody, attempt },
          "warn"
        );

        // Rate limit → fallback immediately
        if (res.status === 429) break;

        // Retry only on server errors
        if (res.status >= 500 && attempt === 1) {
          await new Promise((r) => setTimeout(r, 300 * attempt));
          continue;
        }

        break;
      } catch (err: any) {
        clearTimeout(timeout);

        logEvent(
          "whatsapp_order_network_error",
          { phone, message: err?.message, attempt },
          "error"
        );

        if (attempt === 2) break;

        await new Promise((r) => setTimeout(r, 300 * attempt));
      }
    }
  } else {
    logEvent(
      "whatsapp_order_skipped",
      { reason: "missing_credentials_or_invalid_phone", customerPhone },
      "warn"
    );
  }

  // ============================================================
  // FALLBACK TO EMAIL
  // ============================================================
  const emailResult = await sendOrderEmail({
    to: customerEmail,
    subject: "Your Order Confirmation",
    html: `<p>Hello ${fullName ?? ""},</p>
           <p>Your order has been received.</p>
           <pre>${message}</pre>`,
  });

  if (emailResult.ok) {
    logEvent("order_email_fallback_sent", { customerEmail }, "info");
    return { ok: true, channel: "email_fallback" };
  }

  // ============================================================
  // BOTH FAILED
  // ============================================================
  logEvent(
    "order_delivery_failed",
    {
      customerPhone,
      customerEmail,
      emailErrors: emailResult.errors,
    },
    "error"
  );

  return {
    ok: false,
    error: "delivery_failed",
    details: emailResult.errors,
  };
}
