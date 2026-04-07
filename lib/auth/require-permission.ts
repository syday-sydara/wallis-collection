import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { hasPermission } from "./permissions";
import type { MiddlewareSession } from "./middleware-session";
import type { Permission } from "./permissions";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/security/eventBus";
import { trackPermissionDenied } from "@/lib/auth/permission-rate";

const SECRET = process.env.SESSION_SECRET!;
const COOKIE_NAME = "wallis_session";

/* -------------------------------------------------- */
/* Safe compare                                        */
/* -------------------------------------------------- */
function safeCompare(a: string, b: string) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/* -------------------------------------------------- */
/* Base64 decode                                       */
/* -------------------------------------------------- */
function decode<T>(b64: string): T | null {
  try {
    return JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/* -------------------------------------------------- */
/* Normalize IP                                        */
/* -------------------------------------------------- */
function normalizeIp(ip: string | null): string | null {
  if (!ip) return null;
  return ip.split(",")[0].trim();
}

/* -------------------------------------------------- */
/* v3 Security Center integrated permission enforcement */
/* -------------------------------------------------- */
export async function requirePermission(
  perm: Permission,
  req?: { ip?: string | null; userAgent?: string | null; requestId?: string | null; source?: string | null }
): Promise<MiddlewareSession> {
  const ip = normalizeIp(req?.ip ?? null);
  const userAgent = req?.userAgent ?? null;
  const requestId = req?.requestId ?? null;
  const source = req?.source ?? "app";

  const raw = cookies().get(COOKIE_NAME)?.value;

  /* -------------------------------------------------- */
  /* Missing cookie                                      */
  /* -------------------------------------------------- */
  if (!raw) {
    await emitSecurityEvent({
      type: "SESSION_MISSING",
      message: "No session cookie present",
      severity: "medium",
      ip,
      userAgent,
      category: "auth",
      requestId,
      source,
    });
    throw new Error("Unauthorized: No session cookie");
  }

  const [payloadB64, signature] = raw.split(".");
  if (!payloadB64 || !signature) {
    await emitSecurityEvent({
      type: "SESSION_MALFORMED",
      message: "Malformed session token",
      severity: "medium",
      ip,
      userAgent,
      category: "auth",
      requestId,
      source,
    });
    throw new Error("Unauthorized: Invalid session format");
  }

  /* -------------------------------------------------- */
  /* Signature validation                                */
  /* -------------------------------------------------- */
  const expected = createHmac("sha256", SECRET).update(payloadB64).digest("hex");
  if (!safeCompare(expected, signature)) {
    await emitSecurityEvent({
      type: "SESSION_SIGNATURE_INVALID",
      message: "Invalid session signature",
      severity: "high",
      ip,
      userAgent,
      category: "auth",
      requestId,
      source,
    });
    throw new Error("Unauthorized: Invalid session signature");
  }

  /* -------------------------------------------------- */
  /* Decode payload                                      */
  /* -------------------------------------------------- */
  const payload = decode<MiddlewareSession & { exp?: number }>(payloadB64);
  if (!payload) {
    await emitSecurityEvent({
      type: "SESSION_DECODE_FAILED",
      message: "Failed to decode session payload",
      severity: "medium",
      ip,
      userAgent,
      category: "auth",
      requestId,
      source,
    });
    throw new Error("Unauthorized: Invalid session payload");
  }

  /* -------------------------------------------------- */
  /* Expiration check                                    */
  /* -------------------------------------------------- */
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    await emitSecurityEvent({
      type: "SESSION_EXPIRED",
      message: "Expired session token",
      severity: "medium",
      ip,
      userAgent,
      category: "auth",
      requestId,
      source,
      metadata: { exp: payload.exp },
    });
    throw new Error("Unauthorized: Session expired");
  }

  /* -------------------------------------------------- */
  /* Permission check                                    */
  /* -------------------------------------------------- */
  const allowed = hasPermission(payload, perm);

  await emitSecurityEvent({
    type: "PERMISSION_CHECK",
    message: `Permission check for ${perm}: ${allowed ? "allowed" : "denied"}`,
    severity: allowed ? "low" : "medium",
    ip,
    userAgent,
    requestId,
    source,
    category: "auth",
    userId: payload.id,
    metadata: {
      permission: perm,
      allowed,
      roles: payload.role,
      directPermissions: payload.permissions,
      deniedPermissions: payload.deniedPermissions,
    },
  });

  /* -------------------------------------------------- */
  /* Permission denial handling                          */
  /* -------------------------------------------------- */
  if (!allowed) {
    const { count } = await trackPermissionDenied(ip ?? "unknown");

    if (count === 10) {
      await emitAlertEvent({
        event: "PERMISSION_DENIED_THRESHOLD_MEDIUM",
        ip,
        userAgent,
        metadata: { permission: perm, attempts: count },
      });
    }

    if (count === 20) {
      await emitAlertEvent({
        event: "PERMISSION_DENIED_THRESHOLD_HIGH",
        ip,
        userAgent,
        metadata: { permission: perm, attempts: count },
      });
    }

    throw new Error("Forbidden: Missing permission " + perm);
  }

  return payload;
}
