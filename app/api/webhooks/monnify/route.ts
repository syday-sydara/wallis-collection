import { processPaymentEvent } from "@/lib/payments/processor";
import {
  verifyMonnifyWebhookSignature,
  extractMonnifyReference
} from "@/lib/payments/providers/monnify";
import { NextRequest, NextResponse } from "next/server";
import { logFraudSignal } from "@/lib/security/fraud";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("monnify-signature") ?? "";

  // --- Signature verification ---
  const valid = verifyMonnifyWebhookSignature(rawBody, signature);
  if (!valid) {
    await logFraudSignal({
      type: "WEBHOOK_SIGNATURE_MISMATCH",
      provider: "monnify",
      metadata: { truncatedBody: rawBody.slice(0, 500) }
    });

    // Signature mismatch = safe to return 400
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // --- Parse after signature check ---
  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // --- Extract reference ---
  const reference = extractMonnifyReference(body);
  if (!reference) {
    await logFraudSignal({
      type: "WEBHOOK_UNKNOWN_ORDER",
      provider: "monnify",
      metadata: { body }
    });

    // Unknown reference → still return 200 to avoid retries
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // --- Optional: Validate event type ---
  const eventType = body?.eventType;
  if (!eventType) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // --- Process event safely ---
  try {
    const result = await processPaymentEvent({
      provider: "monnify",
      reference,
      rawPayload: body,
      source: "webhook"
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    // Log internally but do NOT return 500 to Monnify
    await logFraudSignal({
      type: "WEBHOOK_PROCESSING_ERROR",
      provider: "monnify",
      metadata: { message: err?.message }
    });

    return NextResponse.json({ ok: false }, { status: 200 });
  }
}