// lib/auth/require-permission.ts

import { cookies } from "next/headers";
import { hasPermission } from "./permissions";
import { parseMiddlewareSession } from "./middleware-session";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";
import { trackPermissionDenied } from "@/lib/auth/permission-rate";
import type { Permission } from "./permissions";

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

function normalizeIp(ip: string | null): string | null {
  if (!ip) return null;
  return ip.split(",")[0].trim().replace(/:\d+$/, "");
}

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
  const raw = cookieStore.get("wallis_session")?.value;

  // Prevent oversized cookie attacks
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

  // Reuse your unified session parser
  const user = await parseMiddlewareSession({
    cookies: cookieStore,
    ip,
    userAgent,
    requestId,
    source,
  } as any);

  if (!user) {
    throw new UnauthorizedError("Unauthorized: Invalid session");
  }

  const allowed = hasPermission(user, perm);

  // Log permission check
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
    metadata: {
      permission: perm,
      allowed,
      roles: user.role,
      directPermissions: user.permissions,
      deniedPermissions: user.deniedPermissions,
    },
  });

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
