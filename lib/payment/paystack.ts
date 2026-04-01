// lib/payments/paystack.ts
export async function createPaystackSession(params: {
  email: string;
  amountKobo: number;
  orderId: string;
}) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error("Missing PAYSTACK_SECRET_KEY");
  }

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amountKobo), // ensure integer
      reference: params.orderId,
      callback_url: `${process.env.NEXT_PUBLIC_URL}/checkout/verify?orderId=${params.orderId}`
    })
  });

  if (!res.ok) {
    throw new Error("Paystack API error");
  }

  const data = await res.json();

  if (!data.status) {
    throw new Error(data.message || "Paystack init failed");
  }

  return {
    authorizationUrl: data.data.authorization_url,
    accessCode: data.data.access_code,
    reference: data.data.reference
  };
}
