import crypto from "crypto";
import type { PaymentVerificationResult } from "@/lib/payments/types";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET!;

// --- Webhook signature ---
export function verifyPaystackWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;

  const computed = crypto
    .createHmac("sha512", PAYSTACK_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  // Prevent timingSafeEqual crash
  if (computed.length !== signature.length) return false;

  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}

// --- Verify reference ---
export async function verifyPaystackReference(reference: string): Promise<PaymentVerificationResult> {
  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        status: "error",
        provider: "paystack",
        reference,
        message: `Paystack API error: ${res.status}`,
        raw: await res.text(),
      };
    }

    const data = await res.json();
    const tx = data?.data;

    if (!tx) {
      return {
        status: "error",
        provider: "paystack",
        reference,
        message: "No transaction data returned",
        raw: data,
      };
    }

    // Map Paystack status
    let status: PaymentVerificationResult["status"] = "pending";
    let isFinal = false;

    switch (tx.status) {
      case "success":
        status = "success";
        isFinal = true;
        break;

      case "failed":
      case "reversed":
        status = "failed";
        isFinal = true;
        break;

      case "abandoned":
      case "ongoing":
      case "queued":
      default:
        status = "pending";
        break;
    }

    const amount = Number(tx.amount);
    const paidAt = tx.paid_at ? new Date(tx.paid_at) : undefined;

    return status === "success"
      ? {
          status,
          provider: "paystack",
          reference,
          amount,
          currency: (tx.currency || "NGN").toUpperCase(),
          paidAt: paidAt!,
          providerTransactionId: tx.id?.toString() ?? reference,
          isFinal,
          customer: {
            email: tx.customer?.email,
            name: tx.customer?.first_name,
          },
          raw: data,
        }
      : {
          status,
          provider: "paystack",
          reference,
          message: tx.gateway_response,
          raw: data,
        };
  } catch (err) {
    return {
      status: "error",
      provider: "paystack",
      reference,
      message: (err as Error).message,
      raw: err,
    };
  }
}