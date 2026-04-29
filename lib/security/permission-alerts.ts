// lib/security/permission-alerts.ts

import { redis } from "@/lib/redis";
import { emitAlertEvent, emitSecurityEvent } from "@/lib/events/emitter";
import { normalizeIp } from "@/lib/security/normalize";

import {
  startSpan,
  metricsWithContext,
  log,
  serviceContext,
} from "@/lib/core";

const VERSION = 1;

/* -------------------------------------------------- */
/* Shared throttling helper                            */
/* -------------------------------------------------- */
async function throttle(key: string, limit: number, ttl: number) {
  try {
    const hits = await redis.incr(key);

    if (hits === 1) {
      await redis.expire(key, ttl);
    }

    return hits > limit;
  } catch (err: any) {
    metricsWithContext.increment("security.alerts.redis_error");
    log.warn("Redis unavailable during unauthorized alert throttling", {
      key,
      error: err?.message,
    });
    return false; // fail open
  }
}

/* -------------------------------------------------- */
/* Main Function                                       */
/* -------------------------------------------------- */
export async function maybeSendUnauthorizedAlert(ip: string, count: number) {
  const span = startSpan("security.permission_alerts", {
    ip,
    attempts: count,
  });

  const ctx = serviceContext.get();

  const normalizedIp = normalizeIp(ip) ?? "unknown";

  metricsWithContext.increment("security.unauthorized_attempts");
  metricsWithContext.increment(
    `security.unauthorized_attempts.ip.${normalizedIp}`
  );

  /* -------------------------------------------------- */
  /* Throttle alerts per IP                              */
  /* -------------------------------------------------- */
  const throttleKey = `alert:unauth:${normalizedIp}`;
  const throttled = await throttle(throttleKey, 3, 60);

  if (throttled) {
    metricsWithContext.increment("security.unauthorized_alerts.throttled");
    span.end({ throttled: true });
    return;
  }

  /* -------------------------------------------------- */
  /* Emit SecurityEvent (dashboard visibility)           */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "UNAUTHORIZED_ACCESS_ATTEMPT",
    message: `Unauthorized access attempts from ${normalizedIp}: ${count}`,

    severity: count >= 10 ? "high" : "medium",

    actorType: "unknown",
    actorId: null,

    context: "auth",
    operation: "access",
    category: "auth",

    tags: [
      "auth",
      "unauthorized",
      `attempts:${count}`,
      `ip:${normalizedIp}`,
    ],

    ip: normalizedIp,
    userAgent: ctx.userAgent ?? null,

    metadata: {
      version: VERSION,
      attempts: count,
      throttled,
    },
  });

  /* -------------------------------------------------- */
  /* Threshold-based AlertEvent                          */
  /* -------------------------------------------------- */
  if (count === 5) {
    metricsWithContext.increment("security.unauthorized_alerts.warning");

    emitAlertEvent({
      type: "UNAUTHORIZED_ACCESS_WARNING",
      ip: normalizedIp,
      severity: "medium",
      kind: "alert",
      metadata: {
        attempts: 5,
        version: VERSION,
      },
    });
  }

  if (count === 10) {
    metricsWithContext.increment("security.unauthorized_alerts.critical");

    emitAlertEvent({
      type: "UNAUTHORIZED_ACCESS_CRITICAL",
      ip: normalizedIp,
      severity: "high",
      kind: "alert",
      metadata: {
        attempts: 10,
        version: VERSION,
      },
    });
  }

  span.end({ throttled: false, attempts: count });
}
