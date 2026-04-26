// lib/whatsapp/onboarding/track.ts

import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "../send";

export async function sendTrackingLink(to: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return sendWhatsAppMessage(to, "Order not found.");
  }

  return sendWhatsAppMessage(
    to,
    `Here is your tracking link:\n${process.env.NEXT_PUBLIC_APP_URL}/track/${order.trackingToken}`
  );
}
