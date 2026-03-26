// PATH: lib/notifications.ts

import { sendEmail } from "../notifications/channels/email";
import { sendSMS } from "../notifications/channels/sms";
import { sendWhatsApp } from "../notifications/channels/whatsapp";
import { sendAdminAlert } from "../notifications/channels/admin";

export type NotificationChannel = "EMAIL" | "SMS" | "WHATSAPP" | "ADMIN";

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
    case "EMAIL":
      return sendEmail(payload);

    case "SMS":
      return sendSMS(payload);

    case "WHATSAPP":
      return sendWhatsApp(payload);

    case "ADMIN":
      return sendAdminAlert(payload);

    default:
      throw new Error(`Unknown notification channel: ${channel}`);
  }
}
