// lib/monnify.ts
import crypto from "crypto";

const BASE_URL = "https://sandbox.monnify.com/api/v1";

export async function getMonnifyToken() {
  const apiKey = process.env.MONNIFY_API_KEY!;
  const secretKey = process.env.MONNIFY_SECRET_KEY!;

  const auth = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const data = await res.json();

  if (!data.requestSuccessful) {
    throw new Error("Failed to authenticate with Monnify");
  }

  return data.responseBody.accessToken;
}

export async function initializeMonnifyPayment({
  amount,
  customerName,
  customerEmail,
  reference,
  description,
  redirectUrl,
}: {
  amount: number;
  customerName: string;
  customerEmail: string;
  reference: string;
  description: string;
  redirectUrl: string;
}) {
  const token = await getMonnifyToken();

  const res = await fetch(`${BASE_URL}/transactions/init-transaction`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      customerName,
      customerEmail,
      paymentReference: reference,
      description,
      currency: "NGN",
      contractCode: process.env.MONNIFY_CONTRACT_CODE!,
      redirectUrl,
    }),
  });

  const data = await res.json();

  if (!data.requestSuccessful) {
    throw new Error("Failed to initialize Monnify payment");
  }

  return data.responseBody;
}

export function verifyMonnifyWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;

  const secretKey = process.env.MONNIFY_SECRET_KEY!;

  const computed = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");

  return computed === signature;
}