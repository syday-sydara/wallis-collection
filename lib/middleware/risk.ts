// lib/middleware/risk.ts
import { NextRequest, NextResponse } from "next/server";
import { parseMiddlewareSession } from "@/lib/auth/middleware-session";
import { rateLimited } from "@/lib/api/middleware";

const RISK_THRESHOLD = 60; // users with risk >= 60 are blocked
const RATE_LIMIT_MAX = 5; // max 5 requests per window
const RATE_LIMIT_WINDOW = 60_000; // 1 minute

export async function riskMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect sensitive routes
  if (!pathname.startsWith("/security-center") &&
      !pathname.startsWith("/admin/security")) {
    return NextResponse.next();
  }

  // --- 1️⃣ Session check ---
  const user = await parseMiddlewareSession(req);
  if (!user?.id) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // --- 2️⃣ Rate limiting ---
  const rate = rateLimited(req, `risk:${user.id}`, {
    max: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW,
    namespace: "risk",
  });
  if (rate instanceof Response) return rate;

  // --- 3️⃣ Fetch risk score from internal API ---
  try {
    const res = await fetch(`${req.nextUrl.origin}/api/_internal/risk/${user.id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[RiskMiddleware] Failed to fetch risk for user ${user.id}`);
      return NextResponse.next(); // fail-open
    }

    const data = await res.json();
    const risk = data?.risk_score ?? 0;

    // Block if risk is too high
    if (risk >= RISK_THRESHOLD) {
      return NextResponse.redirect(new URL("/risk-blocked", req.url));
    }

    // Attach rate-limit headers for observability
    const response = NextResponse.next();
    Object.entries(rate.headers).forEach(([key, value]) =>
      response.headers.set(key, value)
    );

    return response;
  } catch (err) {
    console.error(`[RiskMiddleware] Error fetching risk for user ${user.id}:`, err);
    return NextResponse.next(); // fail-open
  }
}

export const config = {
  matcher: ["/security-center/:path*", "/admin/security/:path*"],
};