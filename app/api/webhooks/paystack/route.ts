import { processPaymentEvent } from "@/lib/payments/processor";
import { verifyPaystackWebhookSignature } from "@/lib/payments/providers/paystack";
import { NextRequest, NextResponse } from "next/server";
import { logFraudSignal } from "@/lib/security/fraud";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  // --- Signature verification ---
  const valid = verifyPaystackWebhookSignature(rawBody, signature);
  if (!valid) {
    await logFraudSignal({
      type: "WEBHOOK_SIGNATURE_MISMATCH",
      provider: "paystack",
      metadata: { truncatedBody: rawBody.slice(0, 500) }
    });

    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // --- Parse after signature check ---
  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // --- Validate event type ---
  const event = body?.event;
  if (!event || typeof event !== "string") {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // Only process charge events
  if (!event.startsWith("charge.")) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // --- Extract reference ---
  const reference = body?.data?.reference;
  if (!reference) {
    await logFraudSignal({
      type: "WEBHOOK_UNKNOWN_ORDER",
      provider: "paystack",
      metadata: { body }
    });

    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // --- Process event safely ---
  try {
    const result = await processPaymentEvent({
      provider: "paystack",
      reference,
      rawPayload: body,
      source: "webhook"
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    await logFraudSignal({
      type: "WEBHOOK_PROCESSING_ERROR",
      provider: "paystack",
      metadata: { message: err?.message }
    });

    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
