// lib/payments/providers/paystack.ts
import crypto from "crypto";
import type {
  PaymentVerificationResult,
  PaymentVerificationStatus
} from "@/lib/payment/types";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET!;

//
// 1. Verify webhook signature (must use RAW body)
//
export function verifyPaystackWebhookSignature(
  rawBody: string,
  signature: string | null
) {
  if (!signature) return false;

  const computed = crypto
    .createHmac("sha512", PAYSTACK_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return computed.toLowerCase() === signature.toLowerCase();
}

//
// 2. Verify reference via Paystack API
//
export async function verifyPaystackReference(
  reference: string
): Promise<PaymentVerificationResult> {
  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`
        },
        cache: "no-store"
      }
    );

    if (!res.ok) {
      return {
        provider: "paystack",
        reference,
        status: "error",
        message: `Paystack API error: ${res.status}`,
        raw: await res.text()
      };
    }

    const data = await res.json();
    const tx = data?.data;

    // Normalize Paystack status
    let mapped: PaymentVerificationStatus = "pending";

    switch (tx?.status) {
      case "success":
        mapped = "success";
        break;
      case "failed":
      case "reversed":
        mapped = "failed";
        break;
      case "abandoned":
      case "ongoing":
      default:
        mapped = "pending";
        break;
    }

    return {
      provider: "paystack",
      reference,
      status: mapped,
      amount: tx?.amount,
      currency: tx?.currency,
      paidAt: tx?.paid_at,
      channel: tx?.channel,
      providerTransactionId: tx?.id?.toString(),
      raw: data
    };
  } catch (err) {
    return {
      provider: "paystack",
      reference,
      status: "error",
      message: (err as Error).message,
      raw: err
    };
  }
}