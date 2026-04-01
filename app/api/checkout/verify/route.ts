import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logSecurityEvent } from "@/lib/security/events";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  try {
    // ---------------- PAYSTACK VERIFY ----------------
    if (order.paymentMethod === "PAYSTACK") {
      if (!order.paymentReference) {
        return NextResponse.json({ error: "Missing payment reference" }, { status: 400 });
      }

      const res = await fetch(
        `https://api.paystack.co/transaction/verify/${order.paymentReference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        return NextResponse.json({ error: "Paystack API error" }, { status: 502 });
      }

      const data = await res.json();

      if (data.status && data.data?.status === "success") {
        if (order.paymentStatus !== "PAID") {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "PAID",
              orderStatus: "CONFIRMED",
            },
          });

          await logSecurityEvent({
            userId: order.userId,
            type: "PAYMENT_CONFIRMED",
            message: `Payment confirmed for order ${orderId}`,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}