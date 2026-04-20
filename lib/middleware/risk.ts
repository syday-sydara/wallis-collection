// lib/middleware/risk.ts
import { NextRequest, NextResponse } from "next/server";
import { parseMiddlewareSession } from "@/lib/auth/middleware-session";
import { rateLimited } from "@/lib/api/middleware";

const RISK_THRESHOLD = 60;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60_000;
const RISK_CACHE_TTL = 30_000;

/* -------------------------------------------------- */
/* In-memory fallback cache                            */
/* -------------------------------------------------- */

const memoryCache = new Map<string, { value: number; expires: number }>();

async function cacheGet(key: string): Promise<number | null> {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

async function cacheSet(key: string, value: number, ttlMs: number) {
  memoryCache.set(key, { value, expires: Date.now() + ttlMs });
}

/* -------------------------------------------------- */
/* Middleware                                          */
/* -------------------------------------------------- */

export async function riskMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect sensitive routes
  if (
    !pathname.startsWith("/security-center") &&
    !pathname.startsWith("/admin/security")
  ) {
    return NextResponse.next();
  }

  const correlationId = crypto.randomUUID();

  /* 1️⃣ Session check */
  const user = await parseMiddlewareSession(req);
  if (!user?.id) {
    return redirectWithMeta("/", req, correlationId);
  }

  /* 2️⃣ Rate limiting */
  const rate = await rateLimited(req, `risk:${user.id}`, {
    max: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW,
    namespace: "risk",
  });

  if (rate instanceof Response) {
    rate.headers.set("x-correlation-id", correlationId);
    return rate;
  }

  /* 3️⃣ Risk score lookup (cached) */
  const cacheKey = `risk:user:${user.id}`;
  let riskScore = 0; // ALWAYS a number

  const cached = await cacheGet(cacheKey);
  if (cached !== null) {
    riskScore = cached;
  } else {
    try {
      const res = await fetch(
        `${req.nextUrl.origin}/api/_internal/risk/${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-correlation-id": correlationId,
          },
          cache: "no-store",
        }
      );

      if (res.ok) {
        const data = await res.json();
        riskScore = data?.risk_score ?? 0;
        await cacheSet(cacheKey, riskScore, RISK_CACHE_TTL);
      } else {
        console.warn("[RiskMiddleware] Risk API returned non-OK", {
          userId: user.id,
          correlationId,
        });
      }
    } catch (err) {
      console.error("[RiskMiddleware] Risk API error", {
        userId: user.id,
        correlationId,
        error: String(err),
      });
    }
  }

  /* 4️⃣ IP-based fallback */
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (ip === "unknown") {
    riskScore += 5;
  }

  /* 5️⃣ Soft block (MFA challenge) */
  if (riskScore >= RISK_THRESHOLD && riskScore < RISK_THRESHOLD + 20) {
    return redirectWithMeta("/mfa-challenge", req, correlationId);
  }

  /* 6️⃣ Hard block */
  if (riskScore >= RISK_THRESHOLD + 20) {
    return redirectWithMeta("/risk-blocked", req, correlationId);
  }

  /* 7️⃣ Pass through */
  const response = NextResponse.next();
  Object.entries(rate.headers).forEach(([key, value]) =>
    response.headers.set(key, value)
  );

  response.headers.set("x-correlation-id", correlationId);
  response.headers.set("x-risk-score", String(riskScore));

  return response;
}

/* -------------------------------------------------- */
/* Helper                                              */
/* -------------------------------------------------- */

function redirectWithMeta(path: string, req: NextRequest, cid: string) {
  const res = NextResponse.redirect(new URL(path, req.url));
  res.headers.set("x-correlation-id", cid);
  return res;
}

export const config = {
  matcher: ["/security-center/:path*", "/admin/security/:path*"],
};
