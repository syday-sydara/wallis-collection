// lib/whatsapp/onboarding/orders.ts

import { prisma } from "@/lib/prisma";
import { sendWhatsAppList } from "../list";
import { sendWhatsAppMessage } from "../send";
import { emitSecurityEvent } from "@/lib/events/emitter";

export async function sendOrderSelection(to: string, phone: string) {
  const orders = await prisma.order.findMany({
    where: { phone },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (!orders.length) {
    return sendWhatsAppMessage(
      to,
      "I couldn't find any orders for that phone number."
    );
  }

  if (orders.length === 1) {
    const order = orders[0];

    await emitSecurityEvent({
      type: "WHATSAPP_ONBOARDING_SINGLE_ORDER",
      message: `Single order found for ${phone}`,
      severity: "low",
      context: "whatsapp",
      operation: "send",
      category: "whatsapp",
      tags: ["whatsapp", "onboarding", "single_order"],
      metadata: { phone, orderId: order.id },
    });

    return sendWhatsAppMessage(
      to,
      `I found your order #${order.id.slice(0, 8)}.\nTrack it here:\n${process.env.NEXT_PUBLIC_APP_URL}/track/${order.trackingToken}`
    );
  }

  await emitSecurityEvent({
    type: "WHATSAPP_ONBOARDING_MULTIPLE_ORDERS",
    message: `Multiple orders found for ${phone}`,
    severity: "low",
    context: "whatsapp",
    operation: "send",
    category: "whatsapp",
    tags: ["whatsapp", "onboarding", "multiple_orders"],
    metadata: { phone, count: orders.length },
  });

  return sendWhatsAppList({
    to,
    body: "I found multiple orders. Please select one:",
    buttonText: "Select Order",
    sections: [
      {
        title: "Your Orders",
        rows: orders.map((order) => ({
          id: `order_${order.id}`,
          title: `Order #${order.id.slice(0, 8)}`,
          description: `₦${order.total.toLocaleString()}`,
        })),
      },
    ],
  });
}
