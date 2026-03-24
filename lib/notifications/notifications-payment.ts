// PATH: lib/notifications-payment.ts
// NAME: notifications-payment.ts

import { sendNotification } from "@/lib/notifications/notifications";

/* ---------------------------------- */
/* Email Template                     */
/* ---------------------------------- */
export function paymentConfirmationEmail({
  orderId,
  total,
}: {
  orderId: string;
  total: number;
}) {
  return `
Your payment for Order ${orderId} has been confirmed.

💰 Total Paid: ₦${total.toLocaleString()}

We’re now processing your order and will notify you once it ships.

Thank you for shopping with Wallis Collection.
  `;
}

/* ---------------------------------- */
/* SMS Template                       */
/* ---------------------------------- */
export function paymentConfirmationSMS({
  orderId,
  total,
}: {
  orderId: string;
  total: number;
}) {
  return `Wallis Collection: Payment confirmed for order ${orderId}. Amount: ₦${total.toLocaleString()}. Thank you.`;
}

/* ---------------------------------- */
/* WhatsApp Template                  */
/* ---------------------------------- */
export function paymentConfirmationWhatsApp({
  orderId,
  total,
}: {
  orderId: string;
  total: number;
}) {
  return `
🧾 *Wallis Collection – Payment Confirmed*

Your payment for *Order ${orderId}* has been successfully received.

💰 *Amount Paid:* ₦${total.toLocaleString()}

Your order is now being processed. We’ll notify you once it ships.
  `;
}

/* ---------------------------------- */
/* Main Notification Helper           */
/* ---------------------------------- */
export async function notifyPaymentConfirmed(order: {
  id: string;
  email: string;
  phone?: string | null;
  total: number;
}) {
  // Email
  await sendNotification("EMAIL", {
    to: order.email,
    subject: `Payment Confirmed – Order ${order.id}`,
    message: paymentConfirmationEmail({
      orderId: order.id,
      total: order.total,
    }),
    html: paymentConfirmationEmail({
      orderId: order.id,
      total: order.total,
    }),
  });

  // SMS
  if (order.phone) {
    await sendNotification("SMS", {
      to: order.phone,
      message: paymentConfirmationSMS({
        orderId: order.id,
        total: order.total,
      }),
    });
  }

  // WhatsApp
  if (order.phone) {
    await sendNotification("WHATSAPP", {
      to: order.phone,
      message: paymentConfirmationWhatsApp({
        orderId: order.id,
        total: order.total,
      }),
    });
  }

  // Admin alert
  await sendNotification("ADMIN", {
    to: "admin",
    message: `Payment confirmed for order ${order.id} — ₦${order.total.toLocaleString()}`,
  });
}