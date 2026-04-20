// lib/messaging/sendWhatsAppOrder.ts
import { normalizePhoneForWhatsApp } from "@/lib/utils/formatters/phone";
import { generateWhatsAppMessage } from "@/lib/utils/whatsapp";
import type { CartItem } from "@/lib/cart/types";

type SendWhatsAppOrderParams = {
  items: CartItem[];
  total: number;
  fullName?: string;
  customerPhone: string;
};

export async function sendWhatsAppOrder({
  items,
  total,
  fullName,
  customerPhone,
}: SendWhatsAppOrderParams) {
  // 1. Normalize phone number for WhatsApp
  const phone = normalizePhoneForWhatsApp(customerPhone);
  if (!phone) {
    throw new Error("Invalid customer phone number");
  }

  // 2. Generate message text
  const message = generateWhatsAppMessage(items, total, fullName);

  // 3. WhatsApp Cloud API credentials
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    throw new Error("WhatsApp API credentials missing");
  }

  // 4. Build request payload
  const payload = {
    messaging_product: "whatsapp",
    to: phone,
    type: "text",
    text: { body: message },
  };

  // 5. Send message
  const res = await fetch(
    `https://graph.facebook.com/v18.0/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  // 6. Handle API errors
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`WhatsApp API error: ${error}`);
  }

  return { success: true };
}
