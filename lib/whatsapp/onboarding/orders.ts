// lib/whatsapp/onboarding/orders.ts

import { prisma } from "@/lib/prisma";
import { WhatsAppService } from "@/lib/whatsapp/service";
import { emitSecurityEvent } from "@/lib/events/emitter";
import { EventSource } from "@/lib/events/types";

export async function sendOrderSelection(to: string, phone: string) {
  const orders = await prisma.order.findMany({
    where: { phone },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // No orders found
  if (!orders.length) {
    return WhatsAppService.sendText(
      to,
      "I couldn't find any orders for that phone number."
    );
  }

  // Exactly one order found
  if (orders.length === 1) {
    const order = orders[0];

    await emitSecurityEvent({
      kind: "security",
      type: "WHATSAPP_ONBOARDING_SINGLE_ORDER",
      message: `Single order found for ${phone}`,
      severity: "low",
      tags: ["whatsapp", "onboarding", "single_order"],
      metadata: { phone, orderId: order.id },
      source: EventSource.WhatsAppAPI,
    });

    return WhatsAppService.sendText(
      to,
      `I found your order #${order.id.slice(0, 8)}.\nTrack it here:\n${process.env.NEXT_PUBLIC_APP_URL}/track/${order.trackingToken}`
    );
  }

  // Multiple orders found
  await emitSecurityEvent({
    kind: "security",
    type: "WHATSAPP_ONBOARDING_MULTIPLE_ORDERS",
    message: `Multiple orders found for ${phone}`,
    severity: "low",
    tags: ["whatsapp", "onboarding", "multiple_orders"],
    metadata: { phone, count: orders.length },
    source: EventSource.WhatsAppAPI,
  });

  return WhatsAppService.sendList({
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
