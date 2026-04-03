import { processPaymentEvent } from "@/lib/payments/processor";
import {
  verifyMonnifyWebhookSignature,
  extractMonnifyReference
} from "@/lib/payments/providers/monnify";
import { NextRequest, NextResponse } from "next/server";
import { logFraudSignal } from "@/lib/security/fraud";

export async function POST(req: NextRequest) {
  // --- Get raw body as string for signature verification ---
  const rawBody = await req.text();
  const signature = req.headers.get("monnify-signature") ?? "";

  const valid = verifyMonnifyWebhookSignature(rawBody, signature);
  if (!valid) {
    await logFraudSignal({
      type: "WEBHOOK_SIGNATURE_MISMATCH",
      provider: "monnify",
      metadata: { body: rawBody }
    });
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // --- Parse body after verification ---
  const body = JSON.parse(rawBody);

  // --- Extract reference safely ---
  const reference = extractMonnifyReference(body);
  if (!reference) {
    await logFraudSignal({
      type: "WEBHOOK_UNKNOWN_ORDER",
      provider: "monnify",
      metadata: { body }
    });
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // --- Process payment ---
  const result = await processPaymentEvent({
    provider: "monnify",
    reference,
    rawPayload: body,
    source: "webhook"
  });

  return NextResponse.json(result);
}