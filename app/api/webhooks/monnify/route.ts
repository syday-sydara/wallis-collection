import { NextRequest, NextResponse } from "next/server";

import { processPaymentEvent } from "@/lib/payments/processor";
import {
  verifyMonnifyWebhookSignature,
  extractMonnifyReference
} from "@/lib/payments/providers/monnify";

import {
  handleRefundEvent,
  handleChargebackEvent
} from "@/lib/payments/events";

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

    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // --- Parse JSON ---
  let body: any;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const eventType = body?.eventType;
  const eventData = body?.eventData;

  if (!eventType || !eventData) {
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

    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // ============================================================
  // 1. AUTOMATED REFUND DETECTION
  // ============================================================
  if (eventType === "REFUND") {
    const amount = Number(eventData?.amountRefunded ?? 0);

    const result = await handleRefundEvent({
      provider: "monnify",
      reference,
      amount,
      raw: body
    });

    return NextResponse.json(result, { status: 200 });
  }

  // ============================================================
  // 2. AUTOMATED CHARGEBACK / REVERSAL DETECTION
  // ============================================================
  if (
    eventType === "REVERSAL" ||
    eventType === "CHARGEBACK" ||
    eventType === "TRANSACTION_REVERSED"
  ) {
    const amount = Number(eventData?.amountReversed ?? eventData?.amount ?? 0);

    const result = await handleChargebackEvent({
      provider: "monnify",
      reference,
      amount,
      reason: eventData?.reason || eventType,
      raw: body
    });

    return NextResponse.json(result, { status: 200 });
  }

  // ============================================================
  // 3. NORMAL PAYMENT EVENTS (PAYMENT_COMPLETED, PAYMENT_FAILED, etc.)
  // ============================================================
  try {
    const result = await processPaymentEvent({
      provider: "monnify",
      reference,
      rawPayload: body,
      source: "webhook"
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    await logFraudSignal({
      type: "WEBHOOK_PROCESSING_ERROR",
      provider: "monnify",
      metadata: { message: err?.message }
    });

    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
