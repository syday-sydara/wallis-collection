// PATH: lib/notifications.ts
// NAME: notifications.ts

import { orderReceiptTemplate, orderReceiptSMS, orderReceiptWhatsApp } from "@/lib/receipts";

export type NotificationChannel = "EMAIL" | "SMS" | "WHATSAPP" | "ADMIN";

export interface NotificationPayload {
  to: string;
  subject?: string;
  message: string;
  html?: string;
}

/* ---------------------------------- */
/* Email Sender (provider‑agnostic)   */
/* ---------------------------------- */
async function sendEmail(payload: NotificationPayload) {
  console.log("EMAIL:", payload);
}

/* ---------------------------------- */
/* SMS Sender (provider‑agnostic)     */
/* ---------------------------------- */
async function sendSMS(payload: NotificationPayload) {
  console.log("SMS:", payload);
}

/* ---------------------------------- */
/* WhatsApp Sender                    */
/* ---------------------------------- */
async function sendWhatsApp(payload: NotificationPayload) {
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