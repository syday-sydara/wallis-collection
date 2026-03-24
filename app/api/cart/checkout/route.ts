// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import { PaymentMethod } from "@prisma/client";
import { prisma } from "@/lib/db"; // singleton Prisma client

type CartItem = {
  id: string;
  quantity: number;
  priceNaira: number;
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

    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!email || !phone) {
      return NextResponse.json(
        { error: "Email and phone are required" },
        { status: 400 }
      );
    }

    if (!paymentMethod || !Object.values(PaymentMethod).includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    // Calculate total in kobo (cents)
    const totalCents = items.reduce((sum, item) => {
      if (!item.id || !item.quantity || !item.priceNaira) return sum;
      const priceCents = item.priceNaira * 100;
      return sum + priceCents * item.quantity;
    }, 0);

    if (totalCents <= 0) {
      return NextResponse.json(
        { error: "Invalid cart total" },
        { status: 400 }
      );
    }

    // Create order + items
    const order = await prisma.order.create({
      data: {
        email,
        phone,
        paymentMethod,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        totalCents,
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

    /* ---------------- PAYSTACK (kobo) ---------------- */
    if (paymentMethod === PaymentMethod.PAYSTACK) {
      const res = await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            amount: totalCents, // already in kobo
            reference: order.id,
          }),
        }
      );

      if (!res.ok) {
        console.error("Paystack init failed:", await res.text());
        return NextResponse.json(
          { error: "Failed to initialize Paystack payment" },
          { status: 502 }
        );
      }

      const data: any = await res.json();
      paymentUrl = data?.data?.authorization_url ?? "";
    }

    /* ---------------- MONNIFY (naira) ---------------- */
    if (paymentMethod === PaymentMethod.MONNIFY) {
      const res = await fetch(
        "https://api.monnify.com/api/v1/merchant/transactions/init-transaction",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${process.env.MONNIFY_AUTH}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: totalCents / 100, // convert kobo → naira
            customerName: email,
            customerEmail: email,
            paymentReference: order.id,
            currencyCode: "NGN",
          }),
        }
      );

      if (!res.ok) {
        console.error("Monnify init failed:", await res.text());
        return NextResponse.json(
          { error: "Failed to initialize Monnify payment" },
          { status: 502 }
        );
      }

      const data: any = await res.json();
      paymentUrl = data?.responseBody?.checkoutUrl ?? "";
    }

    // COD: no external payment URL needed
    if (paymentMethod === PaymentMethod.COD) {
      paymentUrl = "";
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
