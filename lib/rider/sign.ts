import crypto from "crypto";

const SECRET = process.env.RIDER_SECRET!;

export function signRiderLink(fulfillmentId: string, status: string) {
  const payload = `${fulfillmentId}:${status}`;
  const token = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex");

  return `${process.env.NEXT_PUBLIC_APP_URL}/rider/update?f=${fulfillmentId}&s=${status}&t=${token}`;
}

export function verifyRiderSignature(fulfillmentId: string, status: string, token: string) {
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(`${fulfillmentId}:${status}`)
    .digest("hex");

  return expected === token;
}
