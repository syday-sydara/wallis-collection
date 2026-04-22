// lib/middleware/risk.ts
import { NextRequest, NextResponse } from "next/server";
import { parseMiddlewareSession } from "@/lib/auth/middleware-session";
import { rateLimited } from "@/lib/api/middleware";
import { emitSecurityEvent } from "@/lib/events/emitter";

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
    await emitSecurityEvent({
      type: "AUTH_NO_SESSION",
      message: "User attempted to access protected route without session",
      severity: "medium",
      category: "auth",
      context: "middleware",
      source: "risk_middleware",
      actorType: "anonymous",
      requestId: correlationId,
      tags: ["auth", "no_session"],
      metadata: { path: pathname },
    });

    return redirectWithMeta("/", req, correlationId);
  }

  /* 2️⃣ Rate limiting */
  const rate = await rateLimited(req, `risk:${user.id}`, {
    max: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW,
    namespace: "risk",
  });

  if (rate instanceof Response) {
    await emitSecurityEvent({
      type: "RISK_RATE_LIMITED",
      message: "User hit risk middleware rate limit",
      severity: "medium",
      category: "risk",
      context: "middleware",
      source: "risk_middleware",
      actorType: "user",
      actorId: user.id,
      requestId: correlationId,
      tags: ["risk", "rate_limit"],
      metadata: { path: pathname },
    });

    rate.headers.set("x-correlation-id", correlationId);
    return rate;
  }

  /* 3️⃣ Risk score lookup */
  const cacheKey = `risk:user:${user.id}`;
  let riskScore = 0;

  const cached = await cacheGet(cacheKey);
  if (cached !== null) {
    riskScore = cached;

    await emitSecurityEvent({
      type: "RISK_SCORE_CACHE_HIT",
      message: "Risk score loaded from cache",
      severity: "low",
      category: "risk",
      context: "middleware",
      source: "risk_middleware",
      actorType: "user",
      actorId: user.id,
      requestId: correlationId,
      tags: ["risk", "cache_hit"],
      metadata: { riskScore },
    });
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

        await emitSecurityEvent({
          type: "RISK_SCORE_LOOKUP",
          message: "Risk score fetched from API",
          severity: "low",
          category: "risk",
          context: "middleware",
          source: "risk_middleware",
          actorType: "user",
          actorId: user.id,
          requestId: correlationId,
          tags: ["risk", "lookup"],
          metadata: { riskScore },
        });
      }
    } catch (err) {
      await emitSecurityEvent({
        type: "RISK_SCORE_LOOKUP_FAILED",
        message: "Risk API lookup failed",
        severity: "medium",
        category: "risk",
        context: "middleware",
        source: "risk_middleware",
        actorType: "user",
        actorId: user.id,
        requestId: correlationId,
        tags: ["risk", "lookup_failed"],
        metadata: { error: String(err) },
      });
    }
  }

  /* 4️⃣ IP fallback */
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (ip === "unknown") {
    riskScore += 5;

    await emitSecurityEvent({
      type: "RISK_IP_FALLBACK",
      message: "Unknown IP increased risk score",
      severity: "low",
      category: "risk",
      context: "middleware",
      source: "risk_middleware",
      actorType: "user",
      actorId: user.id,
      requestId: correlationId,
      tags: ["risk", "ip_fallback"],
      metadata: { ip },
    });
  }

  /* 5️⃣ Soft block */
  if (riskScore >= RISK_THRESHOLD && riskScore < RISK_THRESHOLD + 20) {
    await emitSecurityEvent({
      type: "RISK_SOFT_BLOCK",
      message: "User soft-blocked and sent to MFA",
      severity: "medium",
      category: "risk",
      context: "middleware",
      source: "risk_middleware",
      actorType: "user",
      actorId: user.id,
      requestId: correlationId,
      tags: ["risk", "soft_block"],
      metadata: { riskScore },
    });

    return redirectWithMeta("/mfa-challenge", req, correlationId);
  }

  /* 6️⃣ Hard block */
  if (riskScore >= RISK_THRESHOLD + 20) {
    await emitSecurityEvent({
      type: "RISK_HARD_BLOCK",
      message: "User hard-blocked due to high risk score",
      severity: "high",
      category: "risk",
      context: "middleware",
      source: "risk_middleware",
      actorType: "user",
      actorId: user.id,
      requestId: correlationId,
      tags: ["risk", "hard_block"],
      metadata: { riskScore },
    });

    return redirectWithMeta("/risk-blocked", req, correlationId);
  }

  /* 7️⃣ Allowed */
  await emitSecurityEvent({
    type: "RISK_ALLOW",
    message: "User allowed through risk middleware",
    severity: "low",
    category: "risk",
    context: "middleware",
    source: "risk_middleware",
    actorType: "user",
    actorId: user.id,
    requestId: correlationId,
    tags: ["risk", "allow"],
    metadata: { riskScore },
  });

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
