import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();

  const message =
    body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (!message) return NextResponse.json({ status: "ignored" });

  const from = message.from; // WhatsApp phone number
  const text = message.text?.body?.trim();

  // Step 1: Ask for tracking number
  if (!text || text.toLowerCase().includes("track")) {
    await sendWhatsAppMessage(from, "Please enter your tracking number or phone number.");
    return NextResponse.json({ status: "ok" });
  }

  // Step 2: Lookup order
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

  // Step 3: Build Nigerian-friendly message
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

You can also track online:
${process.env.NEXT_PUBLIC_APP_URL}/track/${order.trackingToken}
  `;

  await sendWhatsAppMessage(from, messageText);

  return NextResponse.json({ status: "ok" });
}
