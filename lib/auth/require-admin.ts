// lib/auth/require-permission.ts
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { hasPermission } from "./permissions";
import type { MiddlewareSession } from "./middleware-session";
import type { Permission } from "./permissions";

const SECRET = process.env.SESSION_SECRET!;
const COOKIE_NAME = "wallis_session";

/* -------------------------------------------------- */
/* Safe compare */
function safeCompare(a: string, b: string) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/* -------------------------------------------------- */
/* Base64 decode */
function decode<T>(b64: string): T | null {
  try {
    return JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/* -------------------------------------------------- */
/* Require a specific permission */
export async function requirePermission(
  perm: Permission
): Promise<MiddlewareSession> {
  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) throw new Error("Unauthorized: No session cookie");

  const [payloadB64, signature] = raw.split(".");
  if (!payloadB64 || !signature) {
    throw new Error("Unauthorized: Invalid session format");
  }

  // Validate HMAC
  const expected = createHmac("sha256", SECRET).update(payloadB64).digest("hex");
  if (!safeCompare(expected, signature)) {
    throw new Error("Unauthorized: Invalid session signature");
  }

  // Decode payload
  const payload = decode<MiddlewareSession & { exp?: number }>(payloadB64);
  if (!payload) throw new Error("Unauthorized: Invalid session payload");

  // Check expiration
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    throw new Error("Unauthorized: Session expired");
  }

  // Permission check
  if (!hasPermission(payload, perm)) {
    throw new Error("Forbidden: Missing permission " + perm);
  }

  return payload;
}