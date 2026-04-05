// middleware.admin.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseMiddlewareSession } from "@/lib/auth/middleware-session";
import { hasPermission } from "@/lib/auth/permissions";

function redirectToLogin(req: NextRequest) {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

function redirectToHome(req: NextRequest) {
  return NextResponse.redirect(new URL("/", req.url));
}

export function adminMiddleware(req: NextRequest) {
  const user = parseMiddlewareSession(req);

  // No session → login
  if (!user || typeof user !== "object" || !user.id) {
    return redirectToLogin(req);
  }

  // Permission check
  const allowed = hasPermission(user, "VIEW_ADMIN");

  if (!allowed) {
    // Extract IP safely
    const forwarded = req.headers.get("x-forwarded-for");
    const ip =
      forwarded?.split(",")[0]?.trim().replace(/:\d+$/, "") ||
      req.ip ||
      "unknown";

    // Fire-and-forget logging
    void fetch(`${req.nextUrl.origin}/api/_internal/security-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "ADMIN_ACCESS_DENIED",
        message: "Denied access to admin route",
        path: req.nextUrl.pathname.slice(0, 200),
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

export const config = {
  matcher: ["/admin/:path*"],
};