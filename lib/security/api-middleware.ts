// lib/security/api-middleware.ts

import { NextRequest } from "next/server";
import { parseMiddlewareSession } from "@/lib/auth/middleware-session";
import { requirePermission } from "@/lib/auth/require-permission";
import { rateLimited } from "@/lib/api/rate-limited";
import { emitSecurityEvent } from "@/lib/events/emitter";
import { unauthorized, forbidden, tooManyRequests } from "@/lib/api/response";

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

/* -------------------------------------------------- */
/* v3 API Middleware Wrapper                           */
/* -------------------------------------------------- */
export async function apiMiddleware(
  req: NextRequest,
  options: ApiMiddlewareOptions = {}
): Promise<ApiContext | Response> {
  const { permission, rateLimit, requireSession = true } = options;

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
      route: req.nextUrl.pathname,
    });

    if (rl instanceof Response) {
      return rl; // 429 response
    }
  }

  /* -------------------------------------------------- */
  /* Session parsing                                     */
  /* -------------------------------------------------- */
  const session = await parseMiddlewareSession(req);

  if (requireSession && !session) {
    await emitSecurityEvent({
      type: "API_UNAUTHORIZED",
      message: "API request missing valid session",
      severity: "medium",
      ip,
      userAgent,
      requestId,
      category: "auth",
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
        ip,
        userAgent,
        requestId,
        category: "auth",
      });

      return forbidden("Forbidden");
    }
  }

  /* -------------------------------------------------- */
  /* Return unified context                              */
  /* -------------------------------------------------- */
  return {
    session,
    userId: session?.id ?? null,
    ip,
    userAgent,
    requestId,
  };
}
