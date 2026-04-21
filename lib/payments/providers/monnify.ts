import crypto from "crypto";
import type { PaymentVerificationResult } from "@/lib/payments/types";

const MONNIFY_WEBHOOK_SECRET = process.env.MONNIFY_WEBHOOK_SECRET!;
const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY!;
const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY!;
const MONNIFY_BASE_URL = "https://api.monnify.com/api/v1";
const MONNIFY_REFERENCE_PATTERN = /^[A-Za-z0-9._-]{1,128}$/;

function sanitizeMonnifyReference(reference: string): string | null {
  const trimmed = reference.trim();
  return MONNIFY_REFERENCE_PATTERN.test(trimmed) ? trimmed : null;
}

// --- Webhook signature ---
export function verifyMonnifyWebhookSignature(
  rawBody: string,
  signature: string | null
) {
  if (!signature) return false;

  const computed = crypto
    .createHmac("sha512", MONNIFY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (computed.length !== signature.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(signature)
  );
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

  const auth = Buffer.from(
    `${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`
  ).toString("base64");

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
interface MonnifyVerificationOptions {
  rawPayload?: unknown;
  source?: "webhook" | "reconciliation" | "manual";
}

export async function verifyMonnifyReference(
  reference: string,
  _options: MonnifyVerificationOptions = {}
): Promise<PaymentVerificationResult> {
  const safeReference = sanitizeMonnifyReference(reference);
  if (!safeReference) {
    return {
      status: "error",
      provider: "monnify",
      reference,
      message: "Invalid reference format",
      raw: null,
    };
  }

  try {
    const token = await getMonnifyToken();

    const res = await fetch(
      `${MONNIFY_BASE_URL}/transactions/${encodeURIComponent(
        safeReference
      )}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

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

    const paidAt =
      tx.paymentDate != null ? new Date(tx.paymentDate).toISOString() : undefined;
    const amount = Number(tx.amountPaid ?? tx.amount);
    const currency = (tx.currency || "NGN").toUpperCase();
    const channel = tx.paymentMethod ?? tx.paymentMethodCode ?? undefined;
    const fee =
      tx.fee != null
        ? Number(tx.fee)
        : tx.settlementAmount != null && tx.amountPaid != null
        ? Number(tx.amountPaid) - Number(tx.settlementAmount)
        : undefined;

    if (status === "success") {
      return {
        status,
        provider: "monnify",
        reference,
        amount,
        currency,
        paidAt,
        providerTransactionId: tx.transactionReference,
        channel,
        isFinal,
        // optional extensions if your type supports them:
        // fee,
        // providerStatus: tx.paymentStatus,
        raw: data,
      };
    }

    return {
      status,
      provider: "monnify",
      reference,
      message: `Status: ${tx.paymentStatus}`,
      // providerStatus: tx.paymentStatus,
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
