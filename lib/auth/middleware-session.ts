import { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { emitSecurityEvent } from "@/lib/events/emitter";

export type MiddlewareSession = {
  id: string;
  role: string | string[];
  email?: string;
  risk_score?: number;
  permissions?: string[];
  deniedPermissions?: string[];
  exp?: number;
};

const SECRET = process.env.SESSION_SECRET!;
const COOKIE_NAME = "wallis_session";

function safeCompare(a: string, b: string) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function decode<T>(b64: string): T | null {
  try {
    return JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function normalizeIp(ip: string | null): string | null {
  if (!ip) return null;
  return ip.split(",")[0].trim();
}

export async function parseMiddlewareSession(
  req: NextRequest
): Promise<MiddlewareSession | null> {
  const raw = req.cookies.get(COOKIE_NAME)?.value;
  const ip = normalizeIp(req.headers.get("x-forwarded-for"));
  const userAgent = req.headers.get("user-agent");

  // Prevent oversized cookie attacks
  if (!raw || raw.length > 4096) {
    void emitSecurityEvent({
      type: "SESSION_MISSING",
      message: "No session cookie or cookie too large",
      severity: "low",
      ip,
      userAgent,
      category: "auth",
    });
    return null;
  }

  const [payloadB64, signature] = raw.split(".");
  if (!payloadB64 || !signature) {
    void emitSecurityEvent({
      type: "SESSION_MALFORMED",
      message: "Malformed session token",
      severity: "medium",
      ip,
      userAgent,
      category: "auth",
    });
    return null;
  }

  const expected = createHmac("sha256", SECRET)
    .update(payloadB64)
    .digest("hex");

  if (!safeCompare(expected, signature)) {
    void emitSecurityEvent({
      type: "SESSION_SIGNATURE_INVALID",
      message: "Invalid session signature",
      severity: "high",
      ip,
      userAgent,
      category: "auth",
    });
    return null;
  }

  const payload = decode<MiddlewareSession>(payloadB64);
  if (!payload || typeof payload.id !== "string") {
    void emitSecurityEvent({
      type: "SESSION_DECODE_FAILED",
      message: "Failed to decode or invalid payload",
      severity: "medium",
      ip,
      userAgent,
      category: "auth",
    });
    return null;
  }

  // Validate role
  const allowedRoles = ["admin", "user", "security", "auditor"];
  if (typeof payload.role !== "string" || !allowedRoles.includes(payload.role)) {
    void emitSecurityEvent({
      type: "SESSION_ROLE_INVALID",
      message: "Invalid or unauthorized role",
      severity: "high",
      ip,
      userAgent,
      category: "auth",
    });
    return null;
  }

  // Validate permissions
  if (payload.permissions && !Array.isArray(payload.permissions)) {
    void emitSecurityEvent({
      type: "SESSION_PERMISSIONS_INVALID",
      message: "Permissions must be an array",
      severity: "medium",
      ip,
      userAgent,
      category: "auth",
    });
    return null;
  }

  // Expiration check
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    void emitSecurityEvent({
      type: "SESSION_EXPIRED",
      message: "Expired session token",
      severity: "medium",
      ip,
      userAgent,
      category: "auth",
      metadata: { exp: payload.exp },
    });
    return null;
  }

  // Risk hook
  if (payload.risk_score && payload.risk_score >= 80) {
    void emitSecurityEvent({
      type: "SESSION_HIGH_RISK",
      message: `High-risk session detected (score ${payload.risk_score})`,
      severity: "high",
      ip,
      userAgent,
      category: "risk",
      metadata: { risk_score: payload.risk_score },
    });
  }

  return payload;
}
