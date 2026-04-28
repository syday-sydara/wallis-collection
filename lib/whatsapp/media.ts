// lib/whatsapp/media.ts

import { WhatsAppService } from "@/lib/whatsapp/service";

export function sendWhatsAppImage(
  to: string,
  mediaUrl: string,
  caption?: string
) {
  return WhatsAppService.sendMedia({
    to,
    type: "image",
    mediaUrl,
    caption,
  });
}

export function sendWhatsAppDocument(
  to: string,
  mediaUrl: string,
  filename: string,
  caption?: string
) {
  return WhatsAppService.sendMedia({
    to,
    type: "document",
    mediaUrl,
    filename,
    caption,
  });
}
