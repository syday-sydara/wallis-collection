// PATH: lib/notifications/channels/sms.ts

import { NotificationPayload } from "../index";

export async function sendSMS(payload: NotificationPayload) {
  if (!process.env.TERMII_API_KEY) {
    console.error("SMS not configured:", payload);
    return;
  }

  const url = process.env.TERMII_BASE_URL || "https://api.ng.termii.com/api/sms/send";

  const body = {
    api_key: process.env.TERMII_API_KEY,
    to: payload.to,
    from: process.env.TERMII_SENDER_ID || "Wallis",
    sms: payload.message,
    type: "plain",
    channel: "generic",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("SMS SEND ERROR:", await res.text());
  } else {
    console.log("SMS SENT:", payload.to, payload.message);
  }
}
