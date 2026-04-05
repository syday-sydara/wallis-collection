// lib/auth/middleware-session.ts
import { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export type MiddlewareSession = {
  id: string;
  role: string | string[];
  email?: string;
  risk_score?: number;
  permissions?: string[];
  deniedPermissions?: string[];
};

const SECRET = process.env.SESSION_SECRET!;
const COOKIE_NAME = "wallis_session";

/* -------------------------------------------------- */
/* HMAC safe compare */
function safeCompare(a: string, b: string) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/* -------------------------------------------------- */
/* Base64 decode helper */
function decode<T>(b64: string): T | null {
  try {
    return JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/* -------------------------------------------------- */
/* Parse session token from cookie */
export function parseMiddlewareSession(req: NextRequest): MiddlewareSession | null {
  const raw = req.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const [payloadB64, signature] = raw.split(".");
  if (!payloadB64 || !signature) return null;

  const expected = createHmac("sha256", SECRET).update(payloadB64).digest("hex");
  if (!safeCompare(expected, signature)) return null;

  const payload = decode<MiddlewareSession & { exp?: number }>(payloadB64);
  if (!payload) return null;

  if (payload.exp && Date.now() / 1000 > payload.exp) return null;

  return {
    id: payload.id,
    role: payload.role,
    email: payload.email,
    risk_score: payload.risk_score,
    permissions: payload.permissions,
    deniedPermissions: payload.deniedPermissions,
  };
}