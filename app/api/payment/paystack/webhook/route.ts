// PATH: app/api/payments/paystack/webhook/route.ts
// NAME: route.ts

import { NextResponse } from "next/server";
import { verifyPaystackPayment } from "@/lib/payments/paystack";
import { confirmPayment } from "@/lib/orders/confirm-payment";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const event = body?.event;
    const reference = body?.data?.reference;

    if (!reference) {
      return NextResponse.json({ received: true });
    }

    if (event === "charge.success") {
      const result = await verifyPaystackPayment(reference);

      if (result.status === "success") {
        await confirmPayment(result.reference);
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: true });
  }
}