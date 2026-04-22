// lib/whatsapp/onboarding.ts

import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "./send";
import { sendWhatsAppList } from "./list";
import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { emitSecurityEvent } from "@/lib/events/emitter";

export async function handleOnboardingMessage(from: string, text?: string) {
  const normalizedFrom = normalizePhoneForWhatsApp(from) || from;

  /* -------------------------------------------------- */
  /* Log inbound onboarding message                      */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "WHATSAPP_ONBOARDING_MESSAGE_RECEIVED",
    message: `Inbound onboarding message from ${normalizedFrom}`,
    severity: "low",
    context: "whatsapp",
    operation: "access",
    category: "whatsapp",
    tags: ["whatsapp", "onboarding", "inbound"],
    metadata: {
      from: normalizedFrom,
      text,
    },
    source: "whatsapp_webhook",
  });

  /* -------------------------------------------------- */
  /* Step 1: Greeting → ask for phone number             */
  /* -------------------------------------------------- */
  if (!text || /^(hi|hello)\b/i.test(text.trim())) {
    await emitSecurityEvent({
      type: "WHATSAPP_ONBOARDING_STEP_ASK_PHONE",
      message: `Asked ${normalizedFrom} for phone number`,
      severity: "low",
      context: "whatsapp",
      operation: "send",
      category: "whatsapp",
      tags: ["whatsapp", "onboarding", "ask_phone"],
      metadata: { from: normalizedFrom },
    });

    await sendWhatsAppMessage(
      normalizedFrom,
      "Welcome! Please reply with the phone number you used when placing your order."
    );
    return;
  }

  /* -------------------------------------------------- */
  /* Step 2: Treat message as phone number               */
  /* -------------------------------------------------- */
  const phone = text.trim();

  await emitSecurityEvent({
    type: "WHATSAPP_ONBOARDING_PHONE_RECEIVED",
    message: `Received phone number from ${normalizedFrom}`,
    severity: "low",
    context: "whatsapp",
    operation: "validate",
    category: "whatsapp",
    tags: ["whatsapp", "onboarding", "phone_received"],
    metadata: {
      from: normalizedFrom,
      phone,
    },
  });

  const orders = await prisma.order.findMany({
    where: { phone },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  /* -------------------------------------------------- */
  /* No orders found                                     */
  /* -------------------------------------------------- */
  if (!orders.length) {
    await emitSecurityEvent({
      type: "WHATSAPP_ONBOARDING_NO_ORDERS",
      message: `No orders found for phone ${phone}`,
      severity: "medium",
      context: "whatsapp",
      operation: "evaluate",
      category: "whatsapp",
      tags: ["whatsapp", "onboarding", "no_orders"],
      metadata: { from: normalizedFrom, phone },
    });

    await sendWhatsAppMessage(
      normalizedFrom,
      "I couldn't find any orders with that phone number. Please check and try again."
    );
    return;
  }

  /* -------------------------------------------------- */
  /* Exactly one order → send tracking link              */
  /* -------------------------------------------------- */
  if (orders.length === 1) {
    const order = orders[0];

    await emitSecurityEvent({
      type: "WHATSAPP_ONBOARDING_SINGLE_ORDER",
      message: `Single order matched for ${phone}`,
      severity: "low",
      context: "whatsapp",
      operation: "send",
      category: "whatsapp",
      tags: ["whatsapp", "onboarding", "single_order"],
      metadata: {
        from: normalizedFrom,
        phone,
        orderId: order.id,
      },
    });

    await sendWhatsAppMessage(
      normalizedFrom,
      `I found your order #${order.id.slice(0, 8)}.\nYou can track it here:\n${process.env.NEXT_PUBLIC_APP_URL}/track/${order.trackingToken}`
    );
    return;
  }

  /* -------------------------------------------------- */
  /* Multiple orders → send list                         */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "WHATSAPP_ONBOARDING_MULTIPLE_ORDERS",
    message: `Multiple orders found for ${phone}`,
    severity: "low",
    context: "whatsapp",
    operation: "send",
    category: "whatsapp",
    tags: ["whatsapp", "onboarding", "multiple_orders"],
    metadata: {
      from: normalizedFrom,
      phone,
      orderCount: orders.length,
    },
  });

  await sendWhatsAppList({
    to: normalizedFrom,
    body: "I found multiple orders for this phone number. Please select one:",
    buttonText: "Select order",
    sections: [
      {
        title: "Your recent orders",
        rows: orders.map((order) => ({
          id: `order_${order.id}`,
          title: `Order #${order.id.slice(0, 8)}`,
          description: `Total: ₦${order.total.toLocaleString()}`,
        })),
      },
    ],
  });
}
