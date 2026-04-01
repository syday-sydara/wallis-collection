import { processPaymentEvent } from "@/lib/payment/processor";
import {
  verifyMonnifyWebhookSignature,
  extractMonnifyReference
} from "@/lib/payment/providers/monnify";
import { NextRequest, NextResponse } from "next/server";
import { logFraudSignal } from "@/lib/security/fraud";


export async function POST(req: NextRequest) {
  const body = await req.json();
  const signature = req.headers.get("monnify-signature") ?? "";
  const valid = verifyMonnifyWebhookSignature(body, signature);

  if (!valid) {
    await logFraudSignal({
      type: "WEBHOOK_SIGNATURE_MISMATCH",
      provider: "monnify"
    });
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const reference = String(body?.data?.reference ?? "");
  const result = await processPaymentEvent({
    provider: "monnify",
    reference,
    rawPayload: body,
    source: "webhook"
  });

  return NextResponse.json(result);
}
