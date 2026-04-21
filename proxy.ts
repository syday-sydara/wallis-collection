// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseMiddlewareSession } from "@/lib/auth/middleware-session";
import { hasPermission } from "@/lib/auth/permissions";
import { trackPermissionDenied } from "@/lib/security/permission-rate-limit";
import { maybeSendUnauthorizedAlert } from "@/lib/security/permission-alerts";

/* -------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------- */

function getInternalSecurityLogUrl() {
  const baseUrl = process.env.INTERNAL_BASE_URL ?? "http://127.0.0.1:3000";
  return new URL("/api/_internal/security-log", baseUrl).toString();
}

function redirectToLogin(req: NextRequest) {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

function redirectToHome(req: NextRequest) {
  return NextResponse.redirect(new URL("/", req.url));
}

function blockRisk(req: NextRequest) {
  void fetch(getInternalSecurityLogUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "RISK_BLOCK",
      message: `User blocked due to high risk`,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.ip || "unknown",
      userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? "unknown",
      timestamp: Date.now(),
    }),
    keepalive: true,
  }).catch(() => {});

  return NextResponse.redirect(new URL("/risk-blocked", req.url));
}

/* -------------------------------------------------- */
/* Main Middleware Pipeline */
/* -------------------------------------------------- */

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /* -------------------------------------------------- */
  /* 0. Exempt webhooks and internal endpoints */
  /* -------------------------------------------------- */
  if (pathname.startsWith("/api/webhooks") || pathname.startsWith("/api/_internal")) {
    return NextResponse.next();
  }

  /* -------------------------------------------------- */
  /* 1. Parse session (Node-safe) */
  /* -------------------------------------------------- */
  const user = parseMiddlewareSession(req);

  /* -------------------------------------------------- */
  /* 2. Risk Enforcement (Fail Closed) */
  /* Applies to ALL protected routes */
  /* -------------------------------------------------- */
  const risk = (user as any)?.riskScore ?? (user as any)?.risk_score;

  if (!user || risk == null || risk >= 70) {
    return blockRisk(req);
  }

  /* -------------------------------------------------- */
  /* 3. Admin Routes */
  /* -------------------------------------------------- */
  if (pathname.startsWith("/admin")) {
    if (!user?.id) {
      return redirectToLogin(req);
    }

    const allowed = hasPermission(user, "VIEW_ADMIN");

    if (!allowed) {
      const forwarded = req.headers.get("x-forwarded-for");
      const ip =
        forwarded?.split(",")[0]?.trim().replace(/:\d+$/, "") ||
        req.ip ||
        "unknown";

      void fetch(`${getInternalSecurityLogUrl()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ADMIN_ACCESS_DENIED",
          message: "Denied access to admin route",
          path: pathname.slice(0, 200),
          userId: user.id,
          ip,
          userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? "unknown",
          timestamp: Date.now(),
        }),
        keepalive: true,
      }).catch(() => {});

      return redirectToHome(req);
    }

    return NextResponse.next();
  }

  /* -------------------------------------------------- */
  /* 4. Security Center Routes */
  /* -------------------------------------------------- */
  if (pathname.startsWith("/security-center")) {
    const allowed = hasPermission(user, "VIEW_SECURITY_CENTER");

    if (allowed) {
      return NextResponse.next();
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || req.ip || "unknown";
    const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? "unknown";

    const rate = trackPermissionDenied(ip);

    if (rate.allowed) {
      maybeSendUnauthorizedAlert(ip, rate.count);
    }

    if (rate.allowed) {
      void fetch(getInternalSecurityLogUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id ?? null,
          type: "PERMISSION_DENIED",
          message: `Denied access to ${pathname}`,
          ip,
          userAgent,
          timestamp: Date.now(),
        }),
        keepalive: true,
      }).catch(() => {});
    }

    return NextResponse.redirect(new URL("/", req.url));
  }

  /* -------------------------------------------------- */
  /* 5. Default: allow */
  /* -------------------------------------------------- */
  return NextResponse.next();
}

/* -------------------------------------------------- */
/* Node Runtime + Route Matching */
/* -------------------------------------------------- */

export const config = {
  runtime: "nodejs",
  matcher: [
    "/security-center/:path*",
    "/admin/:path*",
  ],
};
