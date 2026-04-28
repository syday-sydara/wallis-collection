// lib/whatsapp/receipt.ts

import { WhatsAppService } from "@/lib/whatsapp/service";

/**
 * Backwards‑compatible wrapper for sending a WhatsApp receipt.
 * All logic is now delegated to WhatsAppService.
 */
export async function sendWhatsAppReceipt(order: any) {
  return WhatsAppService.sendReceipt(order);
}
