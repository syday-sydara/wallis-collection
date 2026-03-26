// PATH: lib/notifications-payment.ts

import { sendNotification } from "@/lib/notifications";
import {
  paymentConfirmationEmail,
  paymentConfirmationSMS,
  paymentConfirmationWhatsApp,
} from "@/lib/notifications/templates/payment-confirmation";

export async function notifyPaymentConfirmed(order: {
  id: string;
  email: string;
  phone?: string | null;
  total: number;
}) {
  /* ---------------------------------- */
  /* EMAIL                              */
  /* ---------------------------------- */
  await sendNotification("EMAIL", {
    to: order.email,
    subject: `Payment Confirmed – Order ${order.id}`,
    message: paymentConfirmationEmail(order.id, order.total),
    html: paymentConfirmationEmail(order.id, order.total),
  });

  /* ---------------------------------- */
  /* SMS                                */
  /* ---------------------------------- */
  if (order.phone) {
    await sendNotification("SMS", {
      to: order.phone,
      message: paymentConfirmationSMS(order.id, order.total),
    });
  }

  /* ---------------------------------- */
  /* WHATSAPP                           */
  /* ---------------------------------- */
  if (order.phone) {
    await sendNotification("WHATSAPP", {
      to: order.phone,
      message: paymentConfirmationWhatsApp(order.id, order.total),
    });
  }

  /* ---------------------------------- */
  /* ADMIN ALERT                        */
  /* ---------------------------------- */
  await sendNotification("ADMIN", {
    to: "admin",
    message: `
Payment confirmed for Order ${order.id}
Amount: ₦${order.total.toLocaleString()}
Customer: ${order.email}
Phone: ${order.phone ?? "N/A"}
Time: ${new Date().toLocaleString()}
    `.trim(),
  });
}
