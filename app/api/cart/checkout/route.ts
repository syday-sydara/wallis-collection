// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/db"; // singleton Prisma client

type CartItem = {
  id: string;
  quantity: number;
  priceNaira: number;
  variants?: Record<string, string>;
  key: string;
};

type CheckoutBody = {
  items: CartItem[];
  email: string;
  phone: string;
  paymentMethod: PaymentMethod;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<CheckoutBody>;
    const { items, email, phone, paymentMethod } = body;

    if (!items || !Array.isArray(items) || items.length === 0)
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    if (!email || !phone)
      return NextResponse.json({ error: "Email and phone are required" }, { status: 400 });

    if (!paymentMethod || !Object.values(PaymentMethod).includes(paymentMethod))
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });

    // Total in kobo
    const totalCents = items.reduce((sum, item) => sum + item.priceNaira * 100 * item.quantity, 0);

    if (totalCents <= 0)
      return NextResponse.json({ error: "Invalid cart total" }, { status: 400 });

    // Create order and save cart snapshot
    const order = await prisma.order.create({
      data: {
        email,
        phone,
        paymentMethod,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        totalCents,
        cartSnapshot: items, // <-- Save cart for recovery
        items: {
          create: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            priceCents: item.priceNaira * 100,
          })),
        },
      },
    });

    let paymentUrl = "";

    // PAYSTACK
    if (paymentMethod === PaymentMethod.PAYSTACK) {
      const res = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: totalCents,
          reference: order.id,
        }),
      });

      if (!res.ok) {
        console.error("Paystack init failed:", await res.text());
        return NextResponse.json({ error: "Failed to initialize Paystack payment" }, { status: 502 });
      }

      const data: any = await res.json();
      paymentUrl = data?.data?.authorization_url ?? "";
    }

    // MONNIFY
    if (paymentMethod === PaymentMethod.MONNIFY) {
      const res = await fetch("https://api.monnify.com/api/v1/merchant/transactions/init-transaction", {
        method: "POST",
        headers: {
          Authorization: `Basic ${process.env.MONNIFY_AUTH}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalCents / 100,
          customerName: email,
          customerEmail: email,
          paymentReference: order.id,
          currencyCode: "NGN",
        }),
      });

      if (!res.ok) {
        console.error("Monnify init failed:", await res.text());
        return NextResponse.json({ error: "Failed to initialize Monnify payment" }, { status: 502 });
      }

      const data: any = await res.json();
      paymentUrl = data?.responseBody?.checkoutUrl ?? "";
    }

    // COD: no external payment URL
    return NextResponse.json({
      orderId: order.id,
      paymentUrl,
      cartSnapshot: order.cartSnapshot, // <-- send snapshot to client
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}