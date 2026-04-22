// lib/security/api-middleware.ts

import { NextRequest } from "next/server";
import { parseMiddlewareSession } from "@/lib/auth/middleware-session";
import { requirePermission } from "@/lib/auth/require-permission";
import { rateLimited } from "@/lib/api/rate-limited";
import { emitSecurityEvent } from "@/lib/events/emitter";
import { unauthorized, forbidden } from "@/lib/api/response";

/* -------------------------------------------------- */
/* Types                                               */
/* -------------------------------------------------- */
export interface ApiMiddlewareOptions {
  permission?: string | null;
  rateLimit?: {
    max?: number;
    windowMs?: number;
    namespace?: string;
    log?: boolean;
  };
  requireSession?: boolean;
}

export interface ApiContext {
  session: any | null;
  userId: string | null;
  ip: string | null;
  userAgent: string | null;
  requestId: string;
  operation: string;
  context: string;
}

/* -------------------------------------------------- */
/* Helpers                                             */
/* -------------------------------------------------- */
function normalizeIp(ip: string | null): string | null {
  if (!ip) return null;
  return ip.split(",")[0].trim().replace(/:\d+$/, "");
}

function generateRequestId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function inferOperation(method: string): string {
  switch (method) {
    case "GET":
      return "access";
    case "POST":
      return "create";
    case "PUT":
    case "PATCH":
      return "update";
    case "DELETE":
      return "delete";
    default:
      return "access";
  }
}

function inferContext(path: string): string {
  if (path.startsWith("/admin")) return "admin";
  if (path.startsWith("/api/security")) return "security";
  if (path.startsWith("/api/orders")) return "delivery";
  if (path.startsWith("/api/payments")) return "payment";
  return "api";
}

/* -------------------------------------------------- */
/* v3 API Middleware Wrapper                           */
/* -------------------------------------------------- */
export async function apiMiddleware(
  req: NextRequest,
  options: ApiMiddlewareOptions = {}
): Promise<ApiContext | Response> {
  const { permission, rateLimit, requireSession = true } = options;

  const method = req.method;
  const path = req.nextUrl.pathname;

  const operation = inferOperation(method);
  const context = inferContext(path);

  /* -------------------------------------------------- */
  /* Extract request context                             */
  /* -------------------------------------------------- */
  const forwarded = req.headers.get("x-forwarded-for");
  const rawIp = forwarded?.split(",")[0] ?? null;
  const ip = normalizeIp(rawIp);
  const userAgent = req.headers.get("user-agent") ?? null;
  const requestId = generateRequestId();

  /* -------------------------------------------------- */
  /* Rate limiting                                       */
  /* -------------------------------------------------- */
  if (rateLimit) {
    const rl = await rateLimited(req, "api", {
      ...rateLimit,
      userId: null,
      route: path,
    });

    if (rl instanceof Response) {
      await emitSecurityEvent({
        type: "API_RATE_LIMIT",
        message: "API request rate limited",
        severity: "low",
        actorType: "unknown",
        actorId: null,
        ip,
        userAgent,
        requestId,
        category: "auth",
        context,
        operation,
        tags: ["api", "rate_limit"],
        metadata: {
          method,
          path,
          query: Object.fromEntries(req.nextUrl.searchParams),
        },
        source: "api",
      });

      return rl;
    }
  }

  /* -------------------------------------------------- */
  /* Session parsing                                     */
  /* -------------------------------------------------- */
  const session = await parseMiddlewareSession(req);

  const actorType = session ? "admin" : "unknown";
  const actorId = session?.id ?? null;

  if (requireSession && !session) {
    await emitSecurityEvent({
      type: "API_UNAUTHORIZED",
      message: "API request missing valid session",
      severity: "medium",
      actorType,
      actorId,
      ip,
      userAgent,
      requestId,
      category: "auth",
      context,
      operation,
      tags: ["api", "unauthorized"],
      metadata: {
        method,
        path,
        query: Object.fromEntries(req.nextUrl.searchParams),
      },
      source: "api",
    });

    return unauthorized("Unauthorized");
  }

  /* -------------------------------------------------- */
  /* Permission enforcement                              */
  /* -------------------------------------------------- */
  if (permission) {
    try {
      await requirePermission(permission as any, {
        ip,
        userAgent,
        requestId,
        source: "api",
      });
    } catch {
      await emitSecurityEvent({
        type: "API_FORBIDDEN",
        message: `Missing permission: ${permission}`,
        severity: "medium",
        actorType,
        actorId,
        ip,
        userAgent,
        requestId,
        category: "auth",
        context,
        operation,
        tags: ["api", "forbidden", `permission:${permission}`],
        metadata: {
          method,
          path,
          query: Object.fromEntries(req.nextUrl.searchParams),
        },
        source: "api",
      });

      return forbidden("Forbidden");
    }
  }

  /* -------------------------------------------------- */
  /* Return unified context                              */
  /* -------------------------------------------------- */
  return {
    session,
    userId: actorId,
    ip,
    userAgent,
    requestId,
    operation,
    context,
  };
}
