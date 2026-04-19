// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseMiddlewareSession } from "@/lib/auth/middleware-session";
import { hasPermission } from "@/lib/auth/permissions";

import { trackPermissionDenied } from "@/lib/security/permission-rate-limit";
import { maybeSendUnauthorizedAlert } from "@/lib/security/permission-alerts";
import { run } from "node:test";

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // Only enforce /security-center/*
  if (!pathname.startsWith("/security-center")) {
    return NextResponse.next();
  }

  /* -------------------------------------------------- */
  /* 1. Parse session (edge-safe) */
  /* -------------------------------------------------- */
  const user = parseMiddlewareSession(req);

  /* -------------------------------------------------- */
  /* 2. Permission check */
  /* -------------------------------------------------- */
  const allowed = hasPermission(user, "VIEW_SECURITY_CENTER");

  if (allowed) {
    return NextResponse.next();
  }

  /* -------------------------------------------------- */
  /* 3. Extract IP + User-Agent safely */
  /* -------------------------------------------------- */
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0].trim() || req.ip || "unknown";
  const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? "unknown";

  /* -------------------------------------------------- */
  /* 4. Rate-limit permission-denied events */
  /* -------------------------------------------------- */
  const rate = trackPermissionDenied(ip);

  /* -------------------------------------------------- */
  /* 5. Trigger alerts at thresholds (async) */
  /* -------------------------------------------------- */
  if (rate.allowed) {
    maybeSendUnauthorizedAlert(ip, rate.count);
  }

  /* -------------------------------------------------- */
  /* 6. Log only if rate-limit allows (fire-and-forget) */
  /* -------------------------------------------------- */
  if (rate.allowed) {
    void fetch(`${origin}/api/_internal/security-log`, {
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

  /* -------------------------------------------------- */
  /* 7. Redirect unauthorized users */
  /* -------------------------------------------------- */
  const redirectUrl = new URL("/", req.url);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/security-center/:path*"],
  runtime: "nodejs",
};