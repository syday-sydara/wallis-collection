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
  const message = generateWhatsAppMessage(items, total, fullName).trim();

  /* -------------------------------------------------- */
  /* 3. Try WhatsApp first                               */
  /* -------------------------------------------------- */
  if (phone) {
    try {
      const waResult = await sendWhatsAppAlert({
        to: phone,
        template: "order_confirmation_text",
        variables: [message],
        severity: "low",
      });

      if (waResult.ok) {
        logEvent(
          "order_delivery_whatsapp",
          { phone, total, itemCount: items.length },
          "info",
        );
        return { ok: true, channel: "whatsapp" };
      }

      logEvent(
        "order_delivery_whatsapp_failed",
        { phone, error: waResult.error },
        "warn",
      );
    } catch (err: any) {
      logEvent(
        "order_delivery_whatsapp_exception",
        { phone, error: err?.message },
        "error",
      );
    }
  } else {
    logEvent(
      "order_delivery_whatsapp_skipped",
      { reason: "invalid_phone", customerPhone },
      "warn",
    );
  }

  /* -------------------------------------------------- */
  /* 4. Fallback to email                                */
  /* -------------------------------------------------- */
  try {
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
      logEvent(
        "order_delivery_email_fallback",
        { customerEmail, total, itemCount: items.length },
        "info",
      );
      return { ok: true, channel: "email_fallback" };
    }

    logEvent(
      "order_delivery_email_failed",
      { customerEmail, errors: emailResult.errors },
      "error",
    );
  } catch (err: any) {
    logEvent(
      "order_delivery_email_exception",
      { customerEmail, error: err?.message },
      "error",
    );
  }

  /* -------------------------------------------------- */
  /* 5. Both failed                                      */
  /* -------------------------------------------------- */
  return {
    ok: false,
    error: "delivery_failed",
  };
}
