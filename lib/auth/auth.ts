// PATH: lib/auth.ts

import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

/* ------------------------------------------------------------
   Generate JWT
------------------------------------------------------------- */
export function signJwt(payload: object, expiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn });
}

/* ------------------------------------------------------------
   Verify JWT
------------------------------------------------------------- */
export function verifyJwt<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as T;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------
   Generate API Token (random, secure)
------------------------------------------------------------- */
export function generateApiToken(length = 48) {
  return crypto.randomBytes(length).toString("hex");
}

/* ------------------------------------------------------------
   Generate OTP (6 digits)
------------------------------------------------------------- */
export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/* ------------------------------------------------------------
   Check if token is expired (timestamp in ms)
------------------------------------------------------------- */
export function isExpired(timestamp: number) {
  return Date.now() > timestamp;
}
