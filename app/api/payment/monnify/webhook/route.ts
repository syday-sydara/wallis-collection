// PATH: app/api/payments/monnify/webhook/route.ts
// NAME: route.ts

import { NextResponse } from "next/server";
import { verifyMonnifyPayment } from "@/lib/payments/monnify";
import { confirmPayment } from "@/lib/orders/confirm-payment";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const transactionReference = body?.eventData?.transactionReference;

    if (!transactionReference) {
      return NextResponse.json({ received: true });
    }

    const result = await verifyMonnifyPayment(transactionReference);

    if (result.paymentStatus === "PAID") {
      const orderId = result.paymentReference;
      await confirmPayment(orderId);
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: true });
  }
}