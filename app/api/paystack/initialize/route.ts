export async function POST(req: Request) {
  const { email, amount, reference } = await req.json();

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amount * 100, // Paystack expects kobo
      reference,
      currency: "NGN",
    }),
  });

  const data = await res.json();
  return Response.json(data);
}