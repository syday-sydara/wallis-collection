// lib/payments/monnify.ts
export async function createMonnifySession(params: {
  email: string;
  amount: number;
  orderId: string;
}) {
  const auth = Buffer
    .from(`${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`)
    .toString("base64");

  const res = await fetch(
    "https://api.monnify.com/api/v1/merchant/transactions/init-transaction",
    {
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
    }
  );

  if (!res.ok) {
    throw new Error("Monnify API error");
  }

  const data = await res.json();

  if (!data.requestSuccessful) {
    throw new Error(data.responseMessage || "Monnify init failed");
  }

  return {
    checkoutUrl: data.response.checkoutUrl,
    transactionReference: data.response.transactionReference,
    paymentReference: data.response.paymentReference
  };
}