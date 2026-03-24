// PATH: lib/notifications/dispatchers/payment.ts
import { sendNotification } from "../index";
import {
  paymentConfirmationEmail,
  paymentConfirmationSMS,
  paymentConfirmationWhatsApp,
} from "../templates/payment-confirmation";

export async function notifyPaymentConfirmed(order: {
  id: string;
  email: string;
  phone?: string | null;
  total: number;
}) {
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

  if (order.phone) {
    await sendNotification("SMS", {
      to: order.phone,
      message: paymentConfirmationSMS({
        orderId: order.id,
        total: order.total,
      }),
    });

    await sendNotification("WHATSAPP", {
      to: order.phone,
      message: paymentConfirmationWhatsApp({
        orderId: order.id,
        total: order.total,
      }),
    });
  }

  await sendNotification("ADMIN", {
    to: "admin",
    message: `Payment confirmed for order ${order.id} — ₦${order.total.toLocaleString()}`,
  });
}