import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { orderId, token } = await req.json();

  if (!orderId || !token) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // SIGNATURE CHECK
  const expected = crypto
    .createHmac("sha256", process.env.ORDER_VERIFY_SECRET!)
    .update(orderId)
    .digest("hex");

  if (token !== expected) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  // FETCH ORDER + PAYMENT
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const payment = await prisma.payment.findFirst({
    where: { orderId, status: "PENDING" },
  });

  if (!payment) {
    return NextResponse.json({ error: "No pending payment" }, { status: 400 });
  }

  // VERIFY WITH PAYSTACK
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${payment.reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Paystack error" }, { status: 502 });
  }

  const data = await res.json();
  const paystackData = data?.data;

  if (!paystackData) {
    return NextResponse.json({ error: "Invalid response" }, { status: 500 });
  }

  // VALIDATIONS
  if (paystackData.status !== "success") {
    return NextResponse.json({ success: false });
  }

  if (paystackData.amount !== order.total * 100) {
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  if (paystackData.currency !== "NGN") {
    return NextResponse.json({ error: "Currency mismatch" }, { status: 400 });
  }

  // TRANSACTION
  await prisma.$transaction(async (tx) => {
    // prevent double processing
    const freshPayment = await tx.payment.findUnique({
      where: { id: payment.id },
    });

    if (freshPayment?.status === "SUCCESS") return;

    // reduce stock
    for (const item of order.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // update payment
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        paidAt: new Date(paystackData.paid_at),
      },
    });

    // update order
    await tx.order.update({
      where: { id: orderId },
      data: {
        orderStatus: "CONFIRMED",
      },
    });
  });

  return NextResponse.json({ success: true });
}