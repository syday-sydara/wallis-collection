// PATH: lib/notifications/channels/admin.ts
// NAME: admin.ts

import { NotificationPayload } from "../index";

export async function sendAdminAlert(payload: NotificationPayload) {
  console.log("ADMIN ALERT:", payload);
}