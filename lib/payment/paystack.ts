// lib/payments/paystack.ts
export async function createPaystackSession(params: {
  email: string;
  amountKobo: number;
  orderId: string;
}) {
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      reference: params.orderId,
      callback_url: `${process.env.NEXT_PUBLIC_URL}/checkout/verify?orderId=${params.orderId}`
    })
  });

  const data = await res.json();
  if (!data.status) throw new Error("Paystack init failed");

  return data.data.authorization_url as string;
}
