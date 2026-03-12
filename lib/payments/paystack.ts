// PATH: lib/paystack.ts
// NAME: paystack.ts

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

/* ---------------------------------- */
/* Initialize Paystack Payment        */
/* ---------------------------------- */
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
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amount * 100, // Paystack expects kobo
      reference: orderId,
      callback_url: callbackUrl,
      currency: "NGN",
    }),
  });

  const data = await res.json();

  if (!data.status) {
    throw new Error(`Paystack init failed: ${data.message}`);
  }

  return {
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference,
  };
}

/* ---------------------------------- */
/* Verify Paystack Payment            */
/* ---------------------------------- */
export async function verifyPaystackPayment(reference: string) {
  const res = await fetch(
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
    throw new Error(`Paystack verification failed: ${data.message}`);
  }

  return data.data;
}