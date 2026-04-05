import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const { orderId, token } = await req.json();

  if (!orderId || !token) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // ---------------- SIGNATURE CHECK ----------------
  const expected = crypto
    .createHmac("sha256", process.env.ORDER_VERIFY_SECRET!)
    .update(orderId)
    .digest("hex");

  if (token !== expected) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  // ---------------- FETCH ORDER ----------------
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // ---------------- FETCH PAYMENT ----------------
  const payment = await prisma.payment.findFirst({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment record missing" }, { status: 400 });
  }

  // ---------------- VERIFY WITH PAYSTACK ----------------
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
    return NextResponse.json({ error: "Paystack API error" }, { status: 502 });
  }

  const data = await res.json();
  const status = data?.data?.status;

  // ---------------- HANDLE STATUS ----------------
  if (status === "success") {
    await prisma.$transaction(async (tx) => {
      const fresh = await tx.order.findUnique({ where: { id: orderId } });
      if (!fresh) throw new Error("Order disappeared");

      if (fresh.paymentStatus !== "PAID") {
        // reduce stock, update order, update payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            paidAt: new Date(data.data.paid_at),
            channel: data.data.channel,
            raw: data,
          },
        });

        await tx.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            orderStatus: "PROCESSING",
          },
        });
      }
    });
  }

  return NextResponse.json({
    success: true,
    paymentStatus: status,
  });
}