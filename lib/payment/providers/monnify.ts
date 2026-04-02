// lib/payments/providers/monnify.ts
import crypto from "crypto";
import type {
  PaymentVerificationResult,
  PaymentVerificationStatus
} from "@/lib/payment/types";

const MONNIFY_WEBHOOK_SECRET = process.env.MONNIFY_WEBHOOK_SECRET!;
const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY!;
const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY!;
const MONNIFY_BASE_URL = "https://api.monnify.com/api/v1";

//
// 1. Verify webhook signature
//
export function verifyMonnifyWebhookSignature(
  rawBody: string, // must be raw, not parsed JSON
  signature: string | null
) {
  if (!signature) return false;

  const computed = crypto
    .createHmac("sha512", MONNIFY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return computed.toLowerCase() === signature.toLowerCase();
}

//
// 2. Extract reference from webhook body
//
export function extractMonnifyReference(body: any): string | null {
  return (
    body?.eventData?.transactionReference ||
    body?.eventData?.paymentReference ||
    body?.eventData?.productReference ||
    null
  );
}

//
// 3. Verify reference via Monnify API
//
async function getMonnifyToken() {
  const auth = Buffer.from(`${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`).toString("base64");

  const res = await fetch(`${MONNIFY_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) throw new Error("Failed to authenticate with Monnify");

  const data = await res.json();
  return data.responseBody.accessToken;
}

export async function verifyMonnifyReference(
  reference: string
): Promise<PaymentVerificationResult> {
  try {
    const token = await getMonnifyToken();

    const res = await fetch(
      `${MONNIFY_BASE_URL}/transactions/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!res.ok) {
      return {
        provider: "monnify",
        reference,
        status: "error",
        message: "Monnify API error",
        raw: await res.text()
      };
    }

    const data = await res.json();
    const status = data?.responseBody?.paymentStatus;

    let mapped: PaymentVerificationStatus = "pending";

    if (status === "PAID") mapped = "success";
    else if (status === "FAILED") mapped = "failed";

    return {
      provider: "monnify",
      reference,
      status: mapped,
      amount: data?.responseBody?.amountPaid,
      currency: data?.responseBody?.currency,
      paidAt: data?.responseBody?.paymentDate,
      channel: data?.responseBody?.paymentMethod,
      providerTransactionId: data?.responseBody?.transactionReference,
      raw: data
    };
  } catch (err) {
    return {
      provider: "monnify",
      reference,
      status: "error",
      message: (err as Error).message,
      raw: err
    };
  }
}