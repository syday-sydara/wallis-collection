// app/api/webhooks/paystack/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logSecurityEvent } from "@/lib/security/events";

export async function POST(req: NextRequest) {
  const body = await req.json();
  // TODO: verify signature

  if (body.event === "charge.success") {
    const reference = body.data.reference as string;

    const updated = await prisma.order.updateMany({
      where: { id: reference, paymentStatus: "PENDING" },
      data: { paymentStatus: "PAID", orderStatus: "CONFIRMED" }
    });

    if (updated > 0) {
      const order = await prisma.order.findUnique({ where: { id: reference } });
      await logSecurityEvent({
        userId: order?.userId,
        type: "PAYMENT_CONFIRMED_WEBHOOK",
        message: `Payment confirmed via webhook for order ${reference}`
      });
    }
  }

  return NextResponse.json({ received: true });
}
