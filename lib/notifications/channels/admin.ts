// PATH: lib/notifications/channels/admin.ts

import { NotificationPayload } from "../index";
import { sendEmail } from "./email";
import { sendWhatsApp } from "./whatsapp";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP;

export async function sendAdminAlert(payload: NotificationPayload) {
  console.log("ADMIN ALERT:", payload);

  // WhatsApp alert (fastest)
  if (ADMIN_WHATSAPP) {
    await sendWhatsApp({
      to: ADMIN_WHATSAPP,
      message: `ADMIN ALERT:\n${payload.message}`,
    });
  }

  // Email fallback
  if (ADMIN_EMAIL) {
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: payload.subject ?? "Admin Alert",
      html: payload.html ?? `<p>${payload.message}</p>`,
      message: payload.message,
    });
  }
}
