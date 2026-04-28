// lib/whatsapp/rider.ts

import { WhatsAppService } from "@/lib/whatsapp/service";

/**
 * Backwards‑compatible wrapper for sending rider update links.
 * All logic is now delegated to WhatsAppService.
 */
export async function sendRiderLinks(fulfillment: any) {
  return WhatsAppService.sendRiderLinks(fulfillment);
}
