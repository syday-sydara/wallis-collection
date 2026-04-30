// lib/whatsapp/send.ts

import { WhatsAppClient } from "./client";

export function sendWhatsAppMessage(
  to: string,
  message: string,
  previewUrl = false,
) {
  return new WhatsAppClient(to).text(message, previewUrl);
}
