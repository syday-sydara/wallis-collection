// PATH: lib/payments/paystack.ts

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

if (!PAYSTACK_SECRET) {
  throw new Error("Missing PAYSTACK_SECRET_KEY environment variable");
}

/* ------------------------------------------------------------
   Helper: Safe fetch with timeout
------------------------------------------------------------- */
async function safeFetch(url: string, options: RequestInit, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw new Error("Paystack request timed out or failed");
  }
}

/* ------------------------------------------------------------
   Initialize Paystack Payment
------------------------------------------------------------- */
export async function initializePaystackPayment({
  email,
  amount,
  orderId,
  callbackUrl,
}: {
  email: string;
  amount: number; // in naira
  orderId: string;
  callbackUrl: string;
}) {
  const res = await safeFetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100), // convert to kobo safely
      reference: orderId,
      callback_url: callbackUrl,
      currency: "NGN",
    }),
  });

  const data = await res.json();

  if (!data.status) {
    throw new Error(`Paystack init failed: ${data.message || "Unknown error"}`);
  }

  return {
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference,
  };
}

/* ------------------------------------------------------------
   Verify Paystack Payment
------------------------------------------------------------- */
export async function verifyPaystackPayment(reference: string) {
  const res = await safeFetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
      },
    }
  );

  const data = await res.json();

  if (!data.status) {
    throw new Error(
      `Paystack verification failed: ${data.message || "Unknown error"}`
    );
  }

  return data.data;
}

/* ------------------------------------------------------------
   Verify Paystack Webhook Signature
------------------------------------------------------------- */
import crypto from "crypto";

export function verifyPaystackSignature(rawBody: string, signature: string) {
  const computed = crypto
    .createHmac("sha512", PAYSTACK_SECRET!)
    .update(rawBody)
    .digest("hex");

  return computed === signature;
}
