import crypto from "crypto";
import type { PaymentVerificationResult } from "@/lib/payments/types";

const MONNIFY_WEBHOOK_SECRET = process.env.MONNIFY_WEBHOOK_SECRET!;
const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY!;
const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY!;
const MONNIFY_BASE_URL = "https://api.monnify.com/api/v1";

// --- Webhook signature ---
export function verifyMonnifyWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;

  const computed = crypto
    .createHmac("sha512", MONNIFY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  // Prevent timingSafeEqual crash
  if (computed.length !== signature.length) return false;

  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}

// --- Extract reference ---
export function extractMonnifyReference(body: any): string | null {
  return (
    body?.eventData?.transactionReference ||
    body?.eventData?.paymentReference ||
    null
  );
}

// --- Token caching ---
let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getMonnifyToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const auth = Buffer.from(`${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`).toString("base64");

  const res = await fetch(`${MONNIFY_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to authenticate with Monnify");
  }

  const data = await res.json();
  cachedToken = data.responseBody.accessToken;
  tokenExpiry = Date.now() + 23 * 60 * 60 * 1000; // 23h buffer

  return cachedToken;
}

// --- Verify reference ---
export async function verifyMonnifyReference(reference: string): Promise<PaymentVerificationResult> {
  try {
    const token = await getMonnifyToken();

    const res = await fetch(`${MONNIFY_BASE_URL}/transactions/${reference}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      return {
        status: "error",
        provider: "monnify",
        reference,
        message: "Monnify API error",
        raw: await res.text(),
      };
    }

    const data = await res.json();
    const tx = data?.responseBody;

    if (!tx) {
      return {
        status: "error",
        provider: "monnify",
        reference,
        message: "No transaction data",
        raw: data,
      };
    }

    let status: PaymentVerificationResult["status"] = "pending";
    let isFinal = false;

    switch (tx.paymentStatus) {
      case "PAID":
      case "OVERPAID":
        status = "success";
        isFinal = true;
        break;

      case "FAILED":
      case "REVERSED":
      case "PARTIALLY_PAID":
        status = "failed";
        isFinal = true;
        break;

      case "PENDING":
      default:
        status = "pending";
        break;
    }

    const paidAt = tx.paymentDate ? new Date(tx.paymentDate) : undefined;
    const amount = Number(tx.amountPaid);

    return status === "success"
      ? {
          status,
          provider: "monnify",
          reference,
          amount,
          currency: tx.currency?.toUpperCase() ?? "NGN",
          paidAt: paidAt!,
          providerTransactionId: tx.transactionReference,
          isFinal,
          customer: {
            email: tx.customerEmail,
            name: tx.customerName,
          },
          raw: data,
        }
      : {
          status,
          provider: "monnify",
          reference,
          message: `Status: ${tx.paymentStatus}`,
          raw: data,
        };
  } catch (err) {
    return {
      status: "error",
      provider: "monnify",
      reference,
      message: (err as Error).message,
      raw: err,
    };
  }
}