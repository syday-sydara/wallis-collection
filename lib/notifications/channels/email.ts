// PATH: lib/notifications/channels/email.ts

import { NotificationPayload } from "../index";

export async function sendEmail(payload: NotificationPayload) {
  console.log("EMAIL:", payload);
}