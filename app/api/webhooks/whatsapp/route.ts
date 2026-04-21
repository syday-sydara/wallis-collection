import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp/send";
import { sendWhatsAppButtons } from "@/lib/whatsapp/buttons";

export async function POST(req: Request) {
  const body = await req.json();

  const message =
    body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (!message) return NextResponse.json({ status: "ignored" });

  const from = message.from;

  // --- Handle button replies ---
  const interactive = message.interactive;
  if (interactive?.type === "button_reply") {
    const id = interactive.button_reply.id;

    if (id === "track_again") {
      await sendWhatsAppMessage(from, "Please enter your tracking number or phone number.");
    }

    if (id === "talk_support") {
      await sendWhatsAppMessage(
        from,
        `You can chat with support here:\nhttps://wa.me/${process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP}`
      );
    }

    if (id === "view_timeline") {
      await sendWhatsAppMessage(
        from,
        `Open your timeline:\n${process.env.NEXT_PUBLIC_APP_URL}/track/${order.trackingToken}`
      );
    }

    return NextResponse.json({ status: "ok" });
  }

  // --- Normal text message flow ---
  const text = message.text?.body?.trim();

  if (!text || text.toLowerCase().includes("track")) {
    await sendWhatsAppMessage(from, "Please enter your tracking number or phone number.");
    return NextResponse.json({ status: "ok" });
  }

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
    await sendWhatsAppMessage(from, "I couldn't find an order with that information. Please check and try again.");
    return NextResponse.json({ status: "ok" });
  }

  const status = order.fulfillments?.[0]?.status || "PENDING";

  const friendlyStatus = {
    PENDING: "Your package is being prepared.",
    IN_TRANSIT: "Your package is on the way.",
    OUT_FOR_DELIVERY: "Rider is on the way to your location.",
    DELIVERED: "Your package has been delivered.",
    FAILED: "Delivery attempt failed.",
  }[status];

  const messageText = `
Order #${order.id.slice(0, 8)}
Name: ${order.fullName}
Phone: ${order.phone}

Status: ${friendlyStatus}

${order.deliveryNotes ? `Notes: ${order.deliveryNotes}\n` : ""}

${order.paymentMethod === "CASH" ? "Payment: Cash on Delivery" : "Payment: Paid"}

Tracking Number: ${order.trackingNumber || "Not available"}
Carrier: ${order.carrier || "Not assigned"}

Track online:
${process.env.NEXT_PUBLIC_APP_URL}/track/${order.trackingToken}
  `;

  await sendWhatsAppMessage(from, messageText);

  await sendWhatsAppButtons(from, "What would you like to do next?", [
    { id: "track_again", title: "Track Again" },
    { id: "talk_support", title: "Talk to Support" },
    { id: "view_timeline", title: "View Timeline" },
  ]);

  return NextResponse.json({ status: "ok" });
}
