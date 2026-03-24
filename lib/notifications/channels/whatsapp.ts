// PATH: lib/notifications/channels/whatsapp.ts

import { NotificationPayload } from "../index";

export async function sendWhatsApp(payload: NotificationPayload) {
  console.log("WHATSAPP:", payload);
}