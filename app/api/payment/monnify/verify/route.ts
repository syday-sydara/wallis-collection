// PATH: app/api/payments/monnify/verify/route.ts
// NAME: route.ts

import { NextResponse } from "next/server";
import { verifyMonnifyPayment } from "@/lib/payments/monnify";
import { confirmPayment } from "@/lib/orders/confirm-payment";

export async function POST(req: Request) {
  try {
    const { transactionReference } = await req.json();

    if (!transactionReference) {
      return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
    }

    const result = await verifyMonnifyPayment(transactionReference);

    if (result.paymentStatus !== "PAID") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const orderId = result.paymentReference;

    await confirmPayment(orderId);

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}