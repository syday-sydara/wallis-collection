// PATH: app/api/webhooks/monnify/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { confirmPayment } from "@/lib/orders/confirm-payment";
import { logError } from "@/lib/errors";

const MONNIFY_SECRET = process.env.MONNIFY_SECRET_KEY!;

export async function POST(req: Request) {
  try {
    // 1. Get the raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("monnify-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }

    // 2. Verify Monnify Signature (HMAC SHA512)
    const expectedSignature = crypto
      .createHmac("sha512", MONNIFY_SECRET)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // 3. Process Transaction Success
    // Monnify sends 'PAID' or 'SUCCESSFUL' based on the event type
    if (payload.eventType === "SUCCESSFUL_TRANSACTION" && payload.eventData.paymentStatus === "PAID") {
      const orderId = payload.eventData.paymentReference;

      // Update order and inventory
      await confirmPayment(orderId);
      
      console.log(`[MONNIFY WEBHOOK] Order ${orderId} confirmed successfully.`);
    }

    // Always return a 200 OK to Monnify to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logError(error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}