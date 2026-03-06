import crypto from "crypto";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("monnify-signature");

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const computed = crypto
    .createHmac("sha512", process.env.MONNIFY_SECRET_KEY!)
    .update(rawBody)
    .digest("hex");

  if (computed !== signature) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(rawBody);

  // Example:
  // event.eventType === "SUCCESSFUL_TRANSACTION"
  // event.eventData.paymentReference
  // event.eventData.amountPaid

  // TODO: update order status in DB
  // await prisma.order.update(...)

  return Response.json({ received: true });
}