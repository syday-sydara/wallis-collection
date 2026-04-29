// lib/whatsapp/onboarding/track.ts

import { prisma } from "@/lib/prisma";
import { WhatsAppService } from "@/lib/whatsapp/service";
import { emitSecurityEvent } from "@/lib/events/emitter";
import { EventSource } from "@/lib/events/types";

export async function sendTrackingLink(to: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    await emitSecurityEvent({
      kind: "security",
      type: "WHATSAPP_ONBOARDING_ORDER_NOT_FOUND",
      message: `Order not found for ID ${orderId}`,
      severity: "medium",
      tags: ["whatsapp", "onboarding", "order_not_found"],
      metadata: { to, orderId },
      source: EventSource.WhatsAppAPI,
    });

    return WhatsAppService.sendText(to, "Order not found.");
  }

  await emitSecurityEvent({
    kind: "security",
    type: "WHATSAPP_ONBOARDING_TRACKING_LINK_SENT",
    message: `Tracking link sent for order ${orderId}`,
    severity: "low",
    tags: ["whatsapp", "onboarding", "tracking_link"],
    metadata: { to, orderId },
    source: EventSource.WhatsAppAPI,
  });

  return WhatsAppService.sendText(
    to,
    `Here is your tracking link:\n${process.env.NEXT_PUBLIC_APP_URL}/track/${order.trackingToken}`
  );
}
