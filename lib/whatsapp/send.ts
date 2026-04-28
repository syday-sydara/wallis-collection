// lib/whatsapp/send.ts

import { WhatsAppService } from "@/lib/whatsapp/service";

/**
 * Backwards‑compatible wrapper for sending a simple WhatsApp text message.
 * All logic is now delegated to WhatsAppService.
 */
export async function sendWhatsAppMessage(to: string, message: string) {
  return WhatsAppService.sendText(to, message);
}
