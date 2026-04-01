// lib/payments/providers/paystack.ts
import crypto from "crypto";
import type {
  PaymentVerificationResult,
  PaymentVerificationStatus
} from "@/lib/payment/types";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET!;

export function verifyPaystackWebhookSignature(
  body: unknown,
  signature: string | null
) {
  if (!signature) return false;

  const computed = crypto
    .createHmac("sha512", PAYSTACK_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest("hex");

  return computed === signature;
}

export async function verifyPaystackReference(
  reference: string
): Promise<PaymentVerificationResult> {
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
      status: "failed",
      raw: await res.text()
    };
  }

  const data = await res.json();
  const status = data?.data?.status as PaymentVerificationStatus | undefined;

  return {
    provider: "paystack",
    reference,
    status: status === "success" ? "success" : "failed",
    raw: data
  };
}
