// lib/whatsapp/send.ts

import { sendWhatsApp } from "./gateway";

export function sendWhatsAppMessage(to: string, message: string) {
  return sendWhatsApp({
    to,
    operation: "text",
    tags: ["text"],
    buildBody: () => ({
      messaging_product: "whatsapp",
      type: "text",
      text: { body: message },
    }),
  });
}
