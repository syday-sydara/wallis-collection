// lib/messaging/sendWhatsAppOrder.ts

import { normalizePhoneForWhatsApp } from "@/lib/utils/formatters/phone";
import { generateWhatsAppMessage } from "@/lib/utils/whatsapp";
import { sendOrderEmail } from "@/lib/email/sendOrderEmail";
import { sendWhatsAppAlert } from "@/lib/alerts/whatsapp";
import { logEvent } from "@/lib/auth/logger";
import type { CartItem } from "@/lib/cart/types";

type SendWhatsAppOrderParams = {
  items: CartItem[];
  total: number;
  fullName?: string;
  customerPhone: string;
  customerEmail: string;
};

export async function sendWhatsAppOrder({
  items,
  total,
  fullName,
  customerPhone,
  customerEmail,
}: SendWhatsAppOrderParams) {
  /* -------------------------------------------------- */
  /* 1. Normalize phone number                           */
  /* -------------------------------------------------- */
  const phone = normalizePhoneForWhatsApp(customerPhone);

  /* -------------------------------------------------- */
  /* 2. Generate message                                 */
  /* -------------------------------------------------- */
  const message = generateWhatsAppMessage(items, total, fullName);

  /* -------------------------------------------------- */
  /* 3. Try WhatsApp first (via template or text)        */
  /* -------------------------------------------------- */
  if (phone) {
    const waResult = await sendWhatsAppAlert({
      to: phone,
      template: "order_confirmation_text", // You can change this
      variables: [message],
      severity: "low",
    });

    if (waResult.ok) {
      logEvent("order_delivery_whatsapp", { phone }, "info");
      return { ok: true, channel: "whatsapp" };
    }

    logEvent(
      "order_delivery_whatsapp_failed",
      { phone, error: waResult.error },
      "warn"
    );
  } else {
    logEvent(
      "order_delivery_whatsapp_skipped",
      { reason: "invalid_phone", customerPhone },
      "warn"
    );
  }

  /* -------------------------------------------------- */
  /* 4. Fallback to email                                */
  /* -------------------------------------------------- */
  const emailResult = await sendOrderEmail({
    to: customerEmail,
    subject: "Your Order Confirmation",
    html: `
      <p>Hello ${fullName ?? ""},</p>
      <p>Your order has been received.</p>
      <pre>${message}</pre>
    `,
  });

  if (emailResult.ok) {
    logEvent("order_delivery_email_fallback", { customerEmail }, "info");
    return { ok: true, channel: "email_fallback" };
  }

  /* -------------------------------------------------- */
  /* 5. Both failed                                      */
  /* -------------------------------------------------- */
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
