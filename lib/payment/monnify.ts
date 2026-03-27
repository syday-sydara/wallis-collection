// lib/payments/monnify.ts
export async function createMonnifySession(params: {
  email: string;
  amount: number;
  orderId: string;
}) {
  const auth = Buffer.from(process.env.MONNIFY_AUTH!).toString("base64");

  const res = await fetch("https://api.monnify.com/api/v1/merchant/transactions/init-transaction", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: params.amount,
      customerName: params.email,
      customerEmail: params.email,
      paymentReference: params.orderId,
      redirectUrl: `${process.env.NEXT_PUBLIC_URL}/checkout/verify?orderId=${params.orderId}`,
      paymentDescription: `Order ${params.orderId}`
    })
  });

  const data = await res.json();
  if (data.requestSuccessful !== true) throw new Error("Monnify init failed");

  return data.response.checkoutUrl;
}
