import crypto from "crypto";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("monnify-signature");

  const computed = crypto
    .createHmac("sha512", process.env.MONNIFY_SECRET_KEY!)
    .update(rawBody)
    .digest("hex");

  const valid = computed === signature;

  if (!valid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(rawBody);

  // TODO: update order status in DB
  // event.eventType === "SUCCESSFUL_TRANSACTION"

  return Response.json({ received: true });
}