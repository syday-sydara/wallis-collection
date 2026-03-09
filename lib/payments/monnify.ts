// lib/monnify.ts

const MONNIFY_BASE_URL = "https://api.monnify.com/api/v1";

const API_KEY = process.env.MONNIFY_API_KEY!;
const SECRET_KEY = process.env.MONNIFY_SECRET_KEY!;
const CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE!;

/* ---------------------------------- */
/* Get Monnify Access Token           */
/* ---------------------------------- */
export async function getMonnifyToken() {
  const auth = Buffer.from(`${API_KEY}:${SECRET_KEY}`).toString("base64");

  const res = await fetch(`${MONNIFY_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!data.requestSuccessful) {
    throw new Error("Failed to authenticate with Monnify");
  }

  return data.responseBody.accessToken;
}

/* ---------------------------------- */
/* Initialize Payment                 */
/* ---------------------------------- */
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

  const res = await fetch(
    `${MONNIFY_BASE_URL}/merchant/transactions/init-transaction`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
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
    throw new Error("Failed to initialize Monnify payment");
  }

  return {
    checkoutUrl: data.responseBody.checkoutUrl,
    transactionReference: data.responseBody.transactionReference,
  };
}

/* ---------------------------------- */
/* Verify Transaction                 */
/* ---------------------------------- */
export async function verifyMonnifyPayment(transactionReference: string) {
  const token = await getMonnifyToken();

  const res = await fetch(
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
    throw new Error("Failed to verify Monnify payment");
  }

  return data.responseBody;
}
