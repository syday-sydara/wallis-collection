// lib/security/api-middleware.ts

import { NextRequest } from "next/server";

import { parseMiddlewareSession } from "@/lib/auth/middleware-session";
import { requirePermission } from "@/lib/auth/require-permission";
import { rateLimited } from "@/lib/api/rate-limited";
import { emitSecurityEvent } from "@/lib/events/emitter";
import { unauthorized, forbidden } from "@/lib/api/response";

import {
  serviceContext,
  startSpan,
  metricsWithContext,
  log,
} from "@/lib/core";

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

  const forwarded = req.headers.get("x-forwarded-for");
  const rawIp = forwarded?.split(",")[0] ?? null;
  const ip = normalizeIp(rawIp);
  const userAgent = req.headers.get("user-agent") ?? null;
  const locale = req.headers.get("accept-language")?.split(",")[0] ?? null;

  const requestId = crypto.randomUUID();
  const traceId = crypto.randomUUID();

  return serviceContext.run(
    { requestId, traceId, ip: ip ?? undefined, userAgent: userAgent ?? undefined, locale: locale ?? undefined },
    async () => {
      const span = startSpan("api.middleware", {
        requestId,
        traceId,
        method,
        path,
        operation,
        context,
      });

      const start = performance.now();
      metricsWithContext.increment("api.middleware.requests");

      try {
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
            metricsWithContext.increment("api.middleware.rate_limited");

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

            span.end({ reason: "rate_limited" });
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
          metricsWithContext.increment("api.middleware.unauthorized");

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

          span.end({ reason: "unauthorized" });
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
          } catch (err: any) {
            metricsWithContext.increment("api.middleware.forbidden");

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

            log.warn("API permission denied", {
              permission,
              actorId,
              path,
              ip,
              userAgent,
              error: err?.message ?? String(err),
            });

            span.end({ reason: "forbidden", permission });
            return forbidden("Forbidden");
          }
        }

        /* -------------------------------------------------- */
        /* Success: return unified context                     */
        /* -------------------------------------------------- */
        metricsWithContext.increment("api.middleware.allowed");

        const duration = performance.now() - start;
        metricsWithContext.timing("api.middleware.duration", duration);

        span.end({
          reason: "allowed",
          duration,
          actorId,
          operation,
          context,
        });

        return {
          session,
          userId: actorId,
          ip,
          userAgent,
          requestId,
          operation,
          context,
        };
      } catch (err: any) {
        const duration = performance.now() - start;
        metricsWithContext.increment("api.middleware.errors");
        metricsWithContext.timing("api.middleware.error_duration", duration);

        log.error("API middleware error", {
          error: err?.message ?? String(err),
          stack: err?.stack,
          path,
          method,
        });

        span.end({
          success: false,
          error: err?.message ?? "Unknown error",
          duration,
        });

        // In middleware context, we can't safely decide a response here,
        // so we surface the error up to the caller.
        throw err;
      }
    }
  );
}
