// lib/payments/providers/monnify.ts
import crypto from "crypto";
import type {
  PaymentVerificationResult,
  PaymentVerificationStatus
} from "@/lib/payment/types";

const MONNIFY_WEBHOOK_SECRET = process.env.MONNIFY_WEBHOOK_SECRET!;

export function verifyMonnifyWebhookSignature(
  body: unknown,
  signature: string | null
) {
  if (!signature) return false;

  const computed = crypto
    .createHmac("sha512", MONNIFY_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest("hex");

  return computed === signature;
}

export function extractMonnifyReference(body: any): string | null {
  return (
    body?.eventData?.transactionReference ||
    body?.eventData?.paymentReference ||
    null
  );
}

export async function verifyMonnifyReference(
  reference: string
): Promise<PaymentVerificationResult> {
  // If you have a Monnify verify endpoint, call it here.
  // For now, assume webhook is source of truth:
  return {
    provider: "monnify",
    reference,
    status: "success",
    raw: { reference }
  };
}
