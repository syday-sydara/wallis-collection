// middleware.risk.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { parseMiddlewareSession } from "@/lib/auth/middleware-session";

function block(req: NextRequest) {
  // Optional: log blocked attempts asynchronously
  void fetch(`${req.nextUrl.origin}/api/_internal/security-log`, {
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

export function riskMiddleware(req: NextRequest) {
  const user = parseMiddlewareSession(req);

  // 🚨 Fail closed: block if no session
  if (!user) return block(req);

  // Use optional chaining to safely read riskScore
  const risk = (user as any).riskScore ?? (user as any).risk_score;

  // 🚨 Fail closed: block if risk is undefined/null or exceeds threshold
  if (risk == null || risk >= 70) {
    return block(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/security-center/:path*", "/admin/security/:path*"],
};