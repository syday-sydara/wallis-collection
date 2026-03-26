// PATH: lib/hash.ts

import crypto from "crypto";

/* ------------------------------------------------------------
   SHA‑256 Hash
------------------------------------------------------------- */
export function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/* ------------------------------------------------------------
   SHA‑512 Hash
------------------------------------------------------------- */
export function sha512(input: string) {
  return crypto.createHash("sha512").update(input).digest("hex");
}

/* ------------------------------------------------------------
   HMAC (SHA‑512)
------------------------------------------------------------- */
export function hmac512(input: string, secret: string) {
  return crypto.createHmac("sha512", secret).update(input).digest("hex");
}

/* ------------------------------------------------------------
   Constant‑time comparison (prevents timing attacks)
------------------------------------------------------------- */
export function safeCompare(a: string, b: string) {
  const buffA = Buffer.from(a);
  const buffB = Buffer.from(b);

  if (buffA.length !== buffB.length) return false;

  return crypto.timingSafeEqual(buffA, buffB);
}

/* ------------------------------------------------------------
   Random string generator
------------------------------------------------------------- */
export function randomString(length = 32) {
  return crypto.randomBytes(length).toString("hex");
}
