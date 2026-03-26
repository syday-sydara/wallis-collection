// PATH: lib/notifications/channels/email.ts

import nodemailer from "nodemailer";
import { NotificationPayload } from "../index";

export async function sendEmail(payload: NotificationPayload) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("Email not configured:", payload);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Wallis Collection" <${process.env.SMTP_USER}>`,
    to: payload.to,
    subject: payload.subject ?? "Notification",
    text: payload.message,
    html: payload.html ?? `<p>${payload.message}</p>`,
  });

  console.log("EMAIL SENT:", payload.to, payload.subject);
}
