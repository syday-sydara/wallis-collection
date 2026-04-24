import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { releaseInventory, confirmInventory } from "@/lib/inventory";

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

  // VERIFY WITH PAYSTACK (with 10s timeout)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  let res;
  try {
    res = await fetch(
      `https://api.paystack.co/transaction/verify/${payment.reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
        cache: "no-store",
        signal: controller.signal,
      }
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    return NextResponse.json({ error: "Paystack error" }, { status: 502 });
  }

  const data = await res.json();
  const paystackData = data?.data;

  if (!paystackData) {
    return NextResponse.json({ error: "Invalid response" }, { status: 500 });
  }

  const status = paystackData.status?.toLowerCase();

  // STILL PROCESSING
  if (status === "processing" || status === "pending") {
    return NextResponse.json({ processing: true }, { status: 202 });
  }

  // FAILED
  if (status !== "success") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });

    try {
      await releaseInventory(orderId);
    } catch (err) {
      console.error("Inventory release failed:", err);
    }

    return NextResponse.json({ success: false }, { status: 400 });
  }

  // VALIDATIONS
  const amount = Number(paystackData.amount);
  const expectedAmount = Math.round(order.total * 100);

  if (amount !== expectedAmount) {
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  if (paystackData.currency?.toUpperCase() !== "NGN") {
    return NextResponse.json({ error: "Currency mismatch" }, { status: 400 });
  }

  // TRANSACTION
  await prisma.$transaction(async (tx) => {
    // Lock payment row
    const freshPayment = await tx.payment.findUnique({
      where: { id: payment.id },
    });

    if (freshPayment?.status === "SUCCESS") return;

    try {
      await confirmInventory(orderId);
    } catch (err) {
      console.error("Inventory confirmation failed:", err);
      throw new Error("Inventory confirmation failed");
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        paidAt: new Date(paystackData.paid_at),
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: {
        orderStatus: "CONFIRMED",
      },
    });
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
