// PATH: lib/payments/monnify.ts

const MONNIFY_BASE_URL = "https://api.monnify.com/api/v1";

const API_KEY = process.env.MONNIFY_API_KEY;
const SECRET_KEY = process.env.MONNIFY_SECRET_KEY;
const CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE;

if (!API_KEY || !SECRET_KEY || !CONTRACT_CODE) {
  throw new Error("Missing Monnify environment variables");
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
    throw new Error("Monnify request timed out or failed");
  }
}

/* ------------------------------------------------------------
   Get Monnify Access Token
------------------------------------------------------------- */
export async function getMonnifyToken() {
  const auth = Buffer.from(`${API_KEY}:${SECRET_KEY}`).toString("base64");

  const res = await safeFetch(`${MONNIFY_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!data.requestSuccessful) {
    throw new Error(`Monnify auth failed: ${data.responseMessage}`);
  }

  return data.responseBody.accessToken;
}

/* ------------------------------------------------------------
   Initialize Payment
------------------------------------------------------------- */
export async function initializeMonnifyPayment({
  amount,
  email,
  name,
  reference,
  redirectUrl,
}: {
  amount: number;
  email: string;
  name: string;
  reference: string;
  redirectUrl: string;
}) {
  const token = await getMonnifyToken();

  const res = await safeFetch(
    `${MONNIFY_BASE_URL}/merchant/transactions/init-transaction`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Number(amount.toFixed(2)),
        customerName: name,
        customerEmail: email,
        paymentReference: reference,
        paymentDescription: "Order Payment",
        currencyCode: "NGN",
        contractCode: CONTRACT_CODE,
        redirectUrl,
      }),
    }
  );

  const data = await res.json();

  if (!data.requestSuccessful) {
    throw new Error(
      `Monnify init failed: ${data.responseMessage || "Unknown error"}`
    );
  }

  return {
    checkoutUrl: data.responseBody.checkoutUrl,
    transactionReference: data.responseBody.transactionReference,
  };
}

/* ------------------------------------------------------------
   Verify Transaction
------------------------------------------------------------- */
export async function verifyMonnifyPayment(transactionReference: string) {
  const token = await getMonnifyToken();

  const res = await safeFetch(
    `${MONNIFY_BASE_URL}/merchant/transactions/query?transactionReference=${transactionReference}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!data.requestSuccessful) {
    throw new Error(
      `Monnify verification failed: ${data.responseMessage || "Unknown error"}`
    );
  }

  return data.responseBody;
}

/* ------------------------------------------------------------
   Verify Monnify Webhook Signature
------------------------------------------------------------- */
import crypto from "crypto";

export function verifyMonnifySignature(payload: string, signature: string) {
  const computed = crypto
    .createHash("sha512")
    .update(payload + SECRET_KEY)
    .digest("hex");

  return computed === signature;
}
