// PATH: lib/notifications/dispatchers/order.ts

import { sendNotification } from "../index";
import {
  orderReceiptTemplate,
  orderReceiptSMS,
  orderReceiptWhatsApp,
} from "../templates/order-receipt";

export async function notifyOrderReceipt(order: {
  id: string;
  email: string;
  phone?: string | null;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
}) {
  await sendNotification("EMAIL", {
    to: order.email,
    subject: `Order Confirmation – ${order.id}`,
    message: orderReceiptTemplate({
      orderId: order.id,
      items: order.items,
      subtotal: order.subtotal,
    }),
    html: orderReceiptTemplate({
      orderId: order.id,
      items: order.items,
      subtotal: order.subtotal,
    }),
  });

  if (order.phone) {
    await sendNotification("SMS", {
      to: order.phone,
      message: orderReceiptSMS({
        orderId: order.id,
        subtotal: order.subtotal,
      }),
    });

    await sendNotification("WHATSAPP", {
      to: order.phone,
      message: orderReceiptWhatsApp({
        orderId: order.id,
        items: order.items,
        subtotal: order.subtotal,
      }),
    });
  }

  await sendNotification("ADMIN", {
    to: "admin",
    message: `New order received: ${order.id} — ₦${order.subtotal.toLocaleString()}`,
  });
}