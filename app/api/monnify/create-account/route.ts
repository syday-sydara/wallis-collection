async function getMonnifyToken() {
  const auth = Buffer.from(
    `${process.env.MONNIFY_API_KEY}:${process.env.MONNIFY_SECRET_KEY}`
  ).toString("base64");

  const res = await fetch("https://sandbox.monnify.com/api/v1/auth/login", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const data = await res.json();
  return data.responseBody.accessToken;
}

export async function POST(req: Request) {
  const { amount, customerName, customerEmail, reference, description } =
    await req.json();

  const token = await getMonnifyToken();

  const res = await fetch(
    "https://sandbox.monnify.com/api/v1/transactions/init-transaction",
    {
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
        contractCode: process.env.MONNIFY_CONTRACT_CODE,
        redirectUrl: `${process.env.NEXTAUTH_URL}/payment/success`,
      }),
    }
  );

  const data = await res.json();
  return Response.json(data);
}