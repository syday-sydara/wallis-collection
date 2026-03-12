// PATH: lib/notifications/index.ts
import { sendEmail } from "./channels/email";
import { sendWhatsApp } from "./channels/whatsapp";
import { sendAdminAlert } from "./channels/admin";

export type NotificationChannel = "EMAIL" | "SMS" | "WHATSAPP" | "ADMIN";

export interface NotificationPayload {
  to: string;
  subject?: string;
  message: string;
  html?: string;
}

export async function sendNotification(
  channel: NotificationChannel,
  payload: NotificationPayload
) {
  switch (channel) {
    case "EMAIL":
      return sendEmail(payload);
    case "SMS":
      return sendSMS(payload);
    case "WHATSAPP":
      return sendWhatsApp(payload);
    case "ADMIN":
      return sendAdminAlert(payload);
  }
}