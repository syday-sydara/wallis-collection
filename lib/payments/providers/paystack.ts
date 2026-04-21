import crypto from "crypto";
import type { PaymentVerificationResult } from "@/lib/payments/types";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET!;
const PAYSTACK_BASE_URL = "https://api.paystack.co";
const PAYSTACK_REFERENCE_PATTERN = /^[A-Za-z0-9._-]{1,128}$/;

function sanitizePaystackReference(reference: string): string | null {
  const trimmed = reference.trim();
  return PAYSTACK_REFERENCE_PATTERN.test(trimmed) ? trimmed : null;
}

// --- Webhook signature ---
export function verifyPaystackWebhookSignature(
  rawBody: string,
  signature: string | null
) {
  if (!signature) return false;

  const computed = crypto
    .createHmac("sha512", PAYSTACK_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (computed.length !== signature.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(signature)
  );
}

// --- Verify reference ---
interface PaystackVerificationOptions {
  rawPayload?: unknown;
  source?: "webhook" | "reconciliation" | "manual";
}

export async function verifyPaystackReference(
  reference: string,
  _options: PaystackVerificationOptions = {}
): Promise<PaymentVerificationResult> {
  const safeReference = sanitizePaystackReference(reference);
  if (!safeReference) {
    return {
      status: "error",
      provider: "paystack",
      reference,
      message: "Invalid Paystack reference format",
      raw: null,
    };
  }

  try {
    const url = new URL(
      `/transaction/verify/${encodeURIComponent(safeReference)}`,
      PAYSTACK_BASE_URL
    );

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        status: "error",
        provider: "paystack",
        reference: safeReference,
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
        reference: safeReference,
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

    // Paystack amount is in kobo – normalize to Naira
    const amount = typeof tx.amount === "number" ? tx.amount / 100 : NaN;
    const paidAt =
      tx.paid_at != null ? new Date(tx.paid_at).toISOString() : undefined;
    const currency = (tx.currency || "NGN").toUpperCase();
    const channel = tx.channel ?? tx.authorization?.channel ?? undefined;
    const providerStatus = tx.status;

    if (status === "success") {
      return {
        status,
        provider: "paystack",
        reference: safeReference,
        amount,
        currency,
        paidAt,
        providerTransactionId: tx.id?.toString() ?? safeReference,
        channel,
        isFinal,
        // providerStatus,
        raw: data,
      };
    }

    return {
      status,
      provider: "paystack",
      reference: safeReference,
      message: tx.gateway_response || `Status: ${tx.status}`,
      // providerStatus,
      raw: data,
    };
  } catch (err) {
    return {
      status: "error",
      provider: "paystack",
      reference: safeReference,
      message: (err as Error).message,
      raw: err,
    };
  }
}
