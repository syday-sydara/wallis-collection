// PATH: lib/notifications/index.ts

import { sendEmail } from "./channels/email";
import { sendWhatsApp } from "./channels/whatsapp";
import { sendAdminAlert } from "./channels/admin";
import { sendSMS } from "./channels/sms";

export enum NotificationChannel {
  EMAIL = "EMAIL",
  SMS = "SMS",
  WHATSAPP = "WHATSAPP",
  ADMIN = "ADMIN",
}

export interface NotificationPayload {
  to: string;
  subject?: string;
  message?: string;
  html?: string;
  meta?: any;
}

export async function sendNotification(
  channel: NotificationChannel,
  payload: NotificationPayload
) {
  switch (channel) {
    case NotificationChannel.EMAIL:
      return sendEmail(payload);

    case NotificationChannel.SMS:
      return sendSMS(payload);

    case NotificationChannel.WHATSAPP:
      return sendWhatsApp(payload);

    case NotificationChannel.ADMIN:
      return sendAdminAlert(payload);

    default:
      throw new Error(`Unknown notification channel: ${channel}`);
  }
}
