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

  // FETCH ORDER
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // FETCH PAYMENT
  const payment = await prisma.payment.findFirst({
    where: { orderId },
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  // Already processed
  if (payment.status === "SUCCESS") {
    return NextResponse.json({ success: true }, { status: 200 });
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

  // STILL PROCESSING
  if (paystackData.status === "ongoing" || paystackData.status === "queued") {
    return NextResponse.json({ processing: true }, { status: 202 });
  }

  // FAILED
  if (paystackData.status !== "success") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });

    return NextResponse.json({ success: false }, { status: 400 });
  }

  // VALIDATIONS
  if (paystackData.amount !== order.total * 100) {
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  if (paystackData.currency !== "NGN") {
    return NextResponse.json({ error: "Currency mismatch" }, { status: 400 });
  }

  // TRANSACTION
  await prisma.$transaction(async (tx) => {
    const freshPayment = await tx.payment.findUnique({
      where: { id: payment.id },
    });

    if (freshPayment?.status === "SUCCESS") return;

    // reduce stock
    for (const item of order.items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
      });

      if (!variant || variant.stock < item.quantity) {
        throw new Error("Insufficient stock");
      }

      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: { decrement: item.quantity },
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

  return NextResponse.json({ success: true }, { status: 200 });
}