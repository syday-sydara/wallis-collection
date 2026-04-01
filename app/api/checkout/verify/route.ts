import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logSecurityEvent } from "@/lib/security/events";

export async function POST(req: NextRequest) {
  const { orderId } = await req.json();

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  // Fetch order with items
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.paymentMethod !== "PAYSTACK") {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }

  if (!order.paymentReference) {
    return NextResponse.json({ error: "Missing payment reference" }, { status: 400 });
  }

  try {
    // ---------------- VERIFY WITH PAYSTACK ----------------
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
    const status = data?.data?.status;

    if (status === "success") {
      // Only update if not already paid
      if (order.paymentStatus !== "PAID") {
        await prisma.$transaction(async (tx) => {
          // Reduce stock safely
          for (const item of order.items) {
            if (item.variantId) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { decrement: item.quantity } }
              });
            }
          }

          // Update order status
          await tx.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "PAID",
              orderStatus: "CONFIRMED",
            },
          });
        });

        await logSecurityEvent({
          type: "PAYMENT_CONFIRMED",
          message: `Payment confirmed for order ${orderId}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      paymentStatus: status,
    });
  } catch (err) {
    console.error("Paystack verification error:", err);

    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
