// lib/auth/require-permission.ts

import { cookies } from "next/headers";
import { hasPermission, type Permission } from "./permissions";
import { parseMiddlewareSession } from "./middleware-session";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";
import { trackPermissionDenied } from "@/lib/auth/permission-rate";

/* -------------------------------------------------- */
/* Errors                                              */
/* -------------------------------------------------- */

class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

/* -------------------------------------------------- */
/* Helpers                                             */
/* -------------------------------------------------- */

function normalizeIp(ip: string | null): string | null {
  if (!ip) return null;
  return ip.split(",")[0].trim().replace(/:\d+$/, "");
}

function limitMetadataSize(obj: any, maxBytes = 5000) {
  try {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json).length;

    if (bytes > maxBytes) {
      return {
        truncated: true,
        preview: json.slice(0, 2000),
        originalBytes: bytes,
      };
    }

    return obj;
  } catch {
    return { error: "metadata_serialization_failed" };
  }
}

/* -------------------------------------------------- */
/* Main API                                            */
/* -------------------------------------------------- */

export async function requirePermission(
  perm: Permission,
  req?: {
    ip?: string | null;
    userAgent?: string | null;
    requestId?: string | null;
    source?: string | null;
  }
) {
  const ip = normalizeIp(req?.ip ?? null);
  const userAgent = req?.userAgent ?? null;
  const requestId = req?.requestId ?? null;
  const source = req?.source ?? "app";

  const cookieStore = await cookies();
  const raw = cookieStore.get("wallis_session")?.value ?? null;

  /* -------------------------------------------------- */
  /* Cookie presence + size check                        */
  /* -------------------------------------------------- */
  if (!raw || raw.length > 4096) {
    void emitSecurityEvent({
      type: "SESSION_MISSING",
      message: "Missing or oversized session cookie",
      severity: "medium",
      ip,
      userAgent,
      category: "auth",
      requestId,
      source,
    });

    throw new UnauthorizedError("Unauthorized: No session cookie");
  }

  /* -------------------------------------------------- */
  /* Parse session using your unified parser             */
  /* -------------------------------------------------- */
  const user = await parseMiddlewareSession({
    cookies: cookieStore,
    headers: {
      get: (key: string) => {
        if (key.toLowerCase() === "x-forwarded-for") return ip ?? null;
        if (key.toLowerCase() === "user-agent") return userAgent ?? null;
        return null;
      },
    },
  } as any);

  if (!user) {
    throw new UnauthorizedError("Unauthorized: Invalid session");
  }

  /* -------------------------------------------------- */
  /* Permission check                                    */
  /* -------------------------------------------------- */
  const allowed = hasPermission(user, perm);

  void emitSecurityEvent({
    type: "PERMISSION_CHECK",
    message: `Permission check for ${perm}: ${allowed ? "allowed" : "denied"}`,
    severity: allowed ? "low" : "medium",
    ip,
    userAgent,
    requestId,
    source,
    category: "auth",
    userId: user.id,
    metadata: limitMetadataSize({
      permission: perm,
      allowed,
      roles: user.role,
      directPermissions: user.permissions,
      deniedPermissions: user.deniedPermissions,
    }),
  });

  /* -------------------------------------------------- */
  /* Denied → Rate limit + Alerts                        */
  /* -------------------------------------------------- */
  if (!allowed) {
    const { count } = await trackPermissionDenied(ip ?? "unknown");

    if (count === 10) {
      void emitAlertEvent({
        event: "PERMISSION_DENIED_THRESHOLD_MEDIUM",
        ip,
        userAgent,
        metadata: { permission: perm, attempts: count },
      });
    }

    if (count === 20) {
      void emitAlertEvent({
        event: "PERMISSION_DENIED_THRESHOLD_HIGH",
        ip,
        userAgent,
        metadata: { permission: perm, attempts: count },
      });
    }

    throw new ForbiddenError(`Forbidden: Missing permission ${perm}`);
  }

  return user;
}
