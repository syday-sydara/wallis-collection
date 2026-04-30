// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseMiddlewareSession } from "@/lib/auth/middleware-session";
import { hasPermission } from "@/lib/auth/permissions";

import { trackPermissionDenied } from "@/lib/security/rate-limit/permissionRate";
import { maybeSendUnauthorizedAlert } from "@/lib/security/rate-limit/permissionAlerts";

import { serviceContext, log, metricsWithContext, startSpan } from "@/lib/core";

/* -------------------------------------------------- */
/* Helpers                                             */
/* -------------------------------------------------- */

function getInternalSecurityLogUrl() {
  const baseUrl = process.env.INTERNAL_BASE_URL ?? "http://127.0.0.1:3000";
  return new URL("/api/_internal/security-log", baseUrl).toString();
}

async function sendSecurityLog(body: Record<string, any>) {
  try {
    await fetch(getInternalSecurityLogUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch (err) {
    log.warn("Failed to send internal security log", { error: String(err) });
  }
}

function redirectToLogin(req: NextRequest) {
  const url = new URL("/login", req.url);
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function redirectToHome(req: NextRequest) {
  return NextResponse.redirect(new URL("/", req.url));
}

async function blockRisk(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim().replace(/:\d+$/, "") ||
    req.ip ||
    "unknown";

  const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? "unknown";

  metricsWithContext.increment("security.risk_block");
  log.warn("Risk block enforced", { ip, userAgent });

  void sendSecurityLog({
    type: "RISK_BLOCK",
    message: "User blocked due to high risk",
    ip,
    userAgent,
    timestamp: Date.now(),
  });

  return NextResponse.redirect(new URL("/risk-blocked", req.url));
}

/* -------------------------------------------------- */
/* Main Proxy Pipeline                                 */
/* -------------------------------------------------- */

export async function proxy(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const traceId = crypto.randomUUID();

  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim().replace(/:\d+$/, "") ||
    req.ip ||
    "unknown";

  const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? "unknown";
  const locale = req.headers.get("accept-language")?.split(",")[0] ?? null;

  return serviceContext.run(
    { requestId, traceId, ip, userAgent, locale },
    async () => {
      const { pathname } = req.nextUrl;

      const span = startSpan("middleware.proxy", {
        requestId,
        traceId,
        path: pathname,
        method: req.method,
      });

      const start = performance.now();
      metricsWithContext.increment("middleware.proxy.requests");

      try {
        /* -------------------------------------------------- */
        /* 0. Exempt webhooks + internal endpoints            */
        /* -------------------------------------------------- */
        if (
          pathname.startsWith("/api/webhooks") ||
          pathname.startsWith("/api/_internal")
        ) {
          metricsWithContext.increment("middleware.proxy.exempt");
          span.end({ reason: "exempt" });
          return NextResponse.next();
        }

        /* -------------------------------------------------- */
        /* 1. Parse session                                   */
        /* -------------------------------------------------- */
        const user = await parseMiddlewareSession(req);

        /* -------------------------------------------------- */
        /* 2. Risk Enforcement (Fail Closed)                  */
        /* -------------------------------------------------- */
        const risk = user?.riskScore ?? user?.risk_score;

        if (!user || risk == null || risk >= 70) {
          metricsWithContext.increment("middleware.proxy.risk_block");
          span.end({ reason: "risk_block", risk });
          return blockRisk(req);
        }

        /* -------------------------------------------------- */
        /* 3. Admin Routes                                    */
        /* -------------------------------------------------- */
        if (pathname.startsWith("/admin")) {
          if (!user?.id) {
            metricsWithContext.increment("middleware.proxy.admin.no_user");
            log.info("Admin access without user", { path: pathname });
            span.end({ reason: "admin_no_user" });
            return redirectToLogin(req);
          }

          const allowed = hasPermission(user, "VIEW_ADMIN");

          if (!allowed) {
            metricsWithContext.increment("middleware.proxy.admin.denied");

            log.warn("Admin access denied", {
              userId: user.id,
              path: pathname,
              ip,
              userAgent,
            });

            void sendSecurityLog({
              type: "ADMIN_ACCESS_DENIED",
              message: "Denied access to admin route",
              path: pathname.slice(0, 200),
              userId: user.id,
              ip,
              userAgent,
              timestamp: Date.now(),
            });

            span.end({ reason: "admin_denied" });
            return redirectToHome(req);
          }

          metricsWithContext.increment("middleware.proxy.admin.allowed");
          span.end({ reason: "admin_allowed" });
          return NextResponse.next();
        }

        /* -------------------------------------------------- */
        /* 4. Security Center Routes                          */
        /* -------------------------------------------------- */
        if (pathname.startsWith("/security-center")) {
          const allowed = hasPermission(user, "VIEW_SECURITY_CENTER");

          if (allowed) {
            metricsWithContext.increment(
              "middleware.proxy.security_center.allowed",
            );
            span.end({ reason: "security_center_allowed" });
            return NextResponse.next();
          }

          metricsWithContext.increment(
            "middleware.proxy.security_center.denied",
          );

          const rate = await trackPermissionDenied(ip);

          if (rate.allowed) {
            await maybeSendUnauthorizedAlert(ip, rate.count);

            void sendSecurityLog({
              userId: user?.id ?? null,
              type: "PERMISSION_DENIED",
              message: `Denied access to ${pathname}`,
              ip,
              userAgent,
              timestamp: Date.now(),
            });
          }

          log.warn("Security center access denied", {
            userId: user?.id,
            path: pathname,
            ip,
            userAgent,
          });

          span.end({ reason: "security_center_denied" });
          return redirectToHome(req);
        }

        /* -------------------------------------------------- */
        /* 5. Default: allow                                  */
        /* -------------------------------------------------- */
        metricsWithContext.increment("middleware.proxy.allowed");
        span.end({ reason: "allowed" });
        return NextResponse.next();
      } catch (err: any) {
        const duration = performance.now() - start;

        metricsWithContext.timing("middleware.proxy.error_duration", duration);
        metricsWithContext.increment("middleware.proxy.errors");

        log.error("Middleware proxy error", {
          error: err?.message ?? String(err),
          stack: err?.stack,
        });

        span.end({
          success: false,
          error: err?.message ?? "Unknown error",
          duration,
        });

        return redirectToHome(req);
      }
    },
  );
}

/* -------------------------------------------------- */
/* Allowed Proxy Config (Next.js 16)                   */
/* -------------------------------------------------- */

export const config = {
  matcher: ["/(admin|security-center)/:path*"],
};
