// lib/security/permission-rate.ts

import { redis } from "@/lib/redis";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";
import { normalizeIp } from "@/lib/security/normalize";

import {
  startSpan,
  metricsWithContext,
  log,
  serviceContext,
} from "@/lib/core";

const WINDOW_SECONDS = 10 * 60; // 10 minutes
const MAX = 20;

/* -------------------------------------------------- */
/* Shared Redis counter helper                         */
/* -------------------------------------------------- */
async function incrementWithExpiry(key: string, ttl: number) {
  try {
    const hits = await redis.incr(key);
    if (hits === 1) await redis.expire(key, ttl);
    return hits;
  } catch (err: any) {
    metricsWithContext.increment("security.permission.redis_error");
    log.warn("Redis unavailable for permission rate-limit", {
      key,
      error: err?.message,
    });
    return null; // fail open
  }
}

/* -------------------------------------------------- */
/* Severity helper                                     */
/* -------------------------------------------------- */
function classifySeverity(count: number): "low" | "medium" | "high" {
  if (count >= 20) return "high";
  if (count >= 10) return "medium";
  return "low";
}

/* -------------------------------------------------- */
/* Main Function                                       */
/* -------------------------------------------------- */
export async function trackPermissionDenied(ip: string) {
  const span = startSpan("security.permission_rate", { ip });

  const ctx = serviceContext.get();
  const normalizedIp = normalizeIp(ip) ?? "unknown";
  const key = `perm:denied:${normalizedIp}`;

  metricsWithContext.increment("security.permission_denied.count");
  metricsWithContext.increment(
    `security.permission_denied.ip.${normalizedIp}`
  );

  /* -------------------------------------------------- */
  /* Redis counter                                       */
  /* -------------------------------------------------- */
  const hits = await incrementWithExpiry(key, WINDOW_SECONDS);

  // Redis failure → fail open but observable
  if (hits === null) {
    const resetAt = Date.now() + WINDOW_SECONDS * 1000;

    span.end({ redisError: true });

    return {
      allowed: true,
      count: 1,
      resetAt,
    };
  }

  const count = hits;
  const allowed = count <= MAX;
  const severity = classifySeverity(count);

  /* -------------------------------------------------- */
  /* Emit SecurityEvent (dashboard visibility)           */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "PERMISSION_DENIED",
    message: `Permission denied from ${normalizedIp} (${count} attempts)`,

    severity,
    actorType: "unknown",
    actorId: null,

    context: "auth",
    operation: "access",
    category: "auth",

    tags: [
      "auth",
      "permission_denied",
      `attempts:${count}`,
      `ip:${normalizedIp}`,
    ],

    ip: normalizedIp,
    userAgent: ctx.userAgent ?? null,

    metadata: {
      attempts: count,
      windowSeconds: WINDOW_SECONDS,
      allowed,
    },
  });

  /* -------------------------------------------------- */
  /* Threshold-based alerts                              */
  /* -------------------------------------------------- */
  if (count === 10) {
    metricsWithContext.increment("security.permission_alert.medium");

    await emitAlertEvent({
      type: "PERMISSION_DENIED_THRESHOLD_MEDIUM",
      ip: normalizedIp,
      metadata: {
        attempts: 10,
        windowSeconds: WINDOW_SECONDS,
      },
    });
  }

  if (count === 20) {
    metricsWithContext.increment("security.permission_alert.high");

    await emitAlertEvent({
      type: "PERMISSION_DENIED_THRESHOLD_HIGH",
      ip: normalizedIp,
      metadata: {
        attempts: 20,
        windowSeconds: WINDOW_SECONDS,
      },
    });
  }

  const resetAt = Date.now() + WINDOW_SECONDS * 1000;

  span.end({
    count,
    allowed,
    severity,
    resetAt,
  });

  return {
    allowed,
    count,
    resetAt,
  };
}
