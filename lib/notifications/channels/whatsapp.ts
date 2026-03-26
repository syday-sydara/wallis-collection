// PATH: lib/notifications/channels/whatsapp.ts

import { NotificationPayload } from "../index";

export async function sendWhatsApp(payload: NotificationPayload) {
  if (!process.env.WHATSAPP_PHONE_ID || !process.env.WHATSAPP_ACCESS_TOKEN) {
    console.error("WhatsApp API not configured");
    return;
  }

  const url = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

  const body = {
    messaging_product: "whatsapp",
    to: payload.to,
    type: "text",
    text: {
      body: payload.message ?? "Notification",
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("WhatsApp send error:", await res.text());
  }
}
