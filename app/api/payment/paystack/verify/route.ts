// PATH: app/api/payments/paystack/verify/route.ts
// NAME: route.ts

import { NextResponse } from "next/server";
import { verifyPaystackPayment } from "@/lib/payments/paystack";
import { confirmPayment } from "@/lib/orders/confirm-payment";

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const result = await verifyPaystackPayment(reference);

    if (result.status !== "success") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const orderId = result.reference;

    await confirmPayment(orderId);

    return NextResponse.json({ success: true, orderId });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}