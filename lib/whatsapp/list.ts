// lib/whatsapp/list.ts

import { WhatsAppService } from "@/lib/whatsapp/service";

export async function sendWhatsAppList(payload: {
  to: string;
  header?: string;
  body: string;
  footer?: string;
  buttonText: string;
  sections: {
    title: string;
    rows: { id: string; title: string; description?: string }[];
  }[];
}) {
  return WhatsAppService.sendList(payload);
}
