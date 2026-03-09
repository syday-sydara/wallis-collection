import { PrismaClient, PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { items, email, phone, paymentMethod } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate total
    const total = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Create order
    const order = await prisma.order.create({
      data: {
        email,
        phone,
        paymentMethod,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        totalCents: total,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            priceCents: item.price,
          })),
        },
      },
    });

    let paymentUrl = "";

    /* ---------------- PAYSTACK ---------------- */
    if (paymentMethod === PaymentMethod.PAYSTACK) {
      const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: total * 100,
          reference: order.id,
        }),
      });

      const data = await res.json();
      paymentUrl = data.data.authorization_url;
    }

    /* ---------------- MONNIFY ---------------- */
    if (paymentMethod === PaymentMethod.MONNIFY) {
      const res = await fetch("https://api.monnify.com/api/v1/merchant/transactions/init-transaction", {
        method: "POST",
        headers: {
          Authorization: `Basic ${process.env.MONNIFY_AUTH}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          customerName: email,
          customerEmail: email,
          paymentReference: order.id,
          currencyCode: "NGN",
        }),
      });

      const data = await res.json();
      paymentUrl = data.responseBody.checkoutUrl;
    }

    return NextResponse.json({
      orderId: order.id,
      paymentUrl,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
