import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { sendWhatsAppMessage } from "@/lib/whatsapp/send";
import { sendTrackingButtons } from "@/lib/whatsapp/events";
import { handleOnboardingMessage } from "@/lib/whatsapp/onboarding";
import { sendTrackingUpdate } from "@/lib/whatsapp/events";

export async function POST(req: Request) {
  const body = await req.json();

  const message =
    body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (!message) {
    return NextResponse.json({ status: "ignored" });
  }

  const from = message.from;
  const type = message.type;

  // ------------------------------------------------------
  // 1. Handle LIST REPLIES (interactive list menu)
  // ------------------------------------------------------
  if (type === "interactive" && message.interactive?.type === "list_reply") {
    const rowId = message.interactive.list_reply.id;

    // Example: "order_abc123"
    if (rowId.startsWith("order_")) {
      const orderId = rowId.replace("order_", "");
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        await sendWhatsAppMessage(from, "Order not found.");
        return NextResponse.json({ status: "ok" });
      }

      await sendWhatsAppMessage(
        from,
        `You selected order #${order.id.slice(0, 8)}.\nTrack it here:\n${process.env.NEXT_PUBLIC_APP_URL}/track/${order.trackingToken}`
      );

      return NextResponse.json({ status: "ok" });
    }

    return NextResponse.json({ status: "ok" });
  }

  // ------------------------------------------------------
  // 2. Handle BUTTON REPLIES
  // ------------------------------------------------------
  if (type === "interactive" && message.interactive?.type === "button_reply") {
    const id = message.interactive.button_reply.id;

    if (id === "track_again") {
      await sendWhatsAppMessage(from, "Please enter your tracking number or phone number.");
      return NextResponse.json({ status: "ok" });
    }

    if (id === "talk_support") {
      await sendWhatsAppMessage(
        from,
        `Chat with support:\nhttps://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}`
      );
      return NextResponse.json({ status: "ok" });
    }

    if (id === "view_timeline") {
      await sendWhatsAppMessage(
        from,
        `Open your timeline:\n${process.env.NEXT_PUBLIC_APP_URL}/track/${order.trackingToken}`
      );
      return NextResponse.json({ status: "ok" });
    }

    return NextResponse.json({ status: "ok" });
  }

  // ------------------------------------------------------
  // 3. Handle TEXT MESSAGES
  // ------------------------------------------------------
  const text = message.text?.body?.trim();

  // Onboarding flow (first-time users)
  if (!text || ["hi", "hello", "hey"].includes(text.toLowerCase())) {
    await handleOnboardingMessage(from, text);
    return NextResponse.json({ status: "ok" });
  }

  // Tracking flow
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { trackingNumber: text },
        { phone: text },
        { trackingToken: text },
      ],
    },
    include: {
      fulfillments: true,
      payments: true,
    },
  });

  if (!order) {
    await sendWhatsAppMessage(
      from,
      "I couldn't find an order with that information. Please check and try again."
    );
    return NextResponse.json({ status: "ok" });
  }

  // Friendly Nigerian status
  const status = order.fulfillments?.[0]?.status || "PENDING";
  const friendlyStatus = {
    PENDING: "Your package is being prepared.",
    IN_TRANSIT: "Your package is on the way.",
    OUT_FOR_DELIVERY: "Rider is on the way to your location.",
    DELIVERED: "Your package has been delivered.",
    FAILED: "Delivery attempt failed.",
  }[status];

  const summary = `
Order #${order.id.slice(0, 8)}
Name: ${order.fullName}
Phone: ${order.phone}

Status: ${friendlyStatus}

${order.deliveryNotes ? `Notes: ${order.deliveryNotes}\n` : ""}

${order.paymentMethod === "CASH" ? "Payment: Cash on Delivery" : "Payment: Paid"}

Track online:
${process.env.NEXT_PUBLIC_APP_URL}/track/${order.trackingToken}
  `;

  await sendWhatsAppMessage(from, summary);

  // Add interactive buttons
  await sendTrackingButtons(from, order);

  return NextResponse.json({ status: "ok" });
}
