// lib/notifications.ts

import { orderReceiptTemplate, orderReceiptSMS, orderReceiptWhatsApp } from "@/lib/receipts";

export type NotificationChannel = "EMAIL" | "SMS" | "WHATSAPP" | "ADMIN";

export interface NotificationPayload {
  to: string;
  subject?: string;
  message: string;
  html?: string;
}

/* ---------------------------------- */
/* Email Sender (plug in provider)    */
/* ---------------------------------- */
async function sendEmail(payload: NotificationPayload) {
  // Example: Resend, SendGrid, Mailgun, etc.
  console.log("EMAIL:", payload);
}

/* ---------------------------------- */
/* SMS Sender (plug in provider)      */
/* ---------------------------------- */
async function sendSMS(payload: NotificationPayload) {
  // Example: Twilio, Termii, Africa's Talking
  console.log("SMS:", payload);
}

/* ---------------------------------- */
/* WhatsApp Sender                    */
/* ---------------------------------- */
async function sendWhatsApp(payload: NotificationPayload) {
  // Example: WhatsApp Cloud API
  console.log("WHATSAPP:", payload);
}

/* ---------------------------------- */
/* Admin Alerts (Slack/Discord/etc.)  */
/* ---------------------------------- */
async function sendAdminAlert(payload: NotificationPayload) {
  console.log("ADMIN ALERT:", payload);
}

/* ---------------------------------- */
/* Dispatcher                         */
/* ---------------------------------- */
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
