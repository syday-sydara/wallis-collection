// lib/security/permission-rate.ts

import { redis } from "@/lib/redis";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";
import { normalizeIp } from "@/lib/security/normalize";

const WINDOW_SECONDS = 10 * 60; // 10 minutes
const MAX = 20;

export async function trackPermissionDenied(ip: string) {
  const normalizedIp = normalizeIp(ip) ?? "unknown";
  const key = `perm:denied:${normalizedIp}`;

  let count = 1;

  /* -------------------------------------------------- */
  /* Redis counter                                       */
  /* -------------------------------------------------- */
  try {
    count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }
  } catch (err) {
    console.error("Redis unavailable for permission rate-limit:", err);

    return {
      allowed: true,
      count: 1,
      resetAt: Date.now() + WINDOW_SECONDS * 1000,
    };
  }

  const allowed = count <= MAX;

  /* -------------------------------------------------- */
  /* Emit SecurityEvent (dashboard visibility)           */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "PERMISSION_DENIED",
    message: `Permission denied from ${normalizedIp} (${count} attempts)`,

    severity:
      count >= 20 ? "high" :
      count >= 10 ? "medium" :
      "low",

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
    await emitAlertEvent({
      type: "PERMISSION_DENIED_THRESHOLD_HIGH",
      ip: normalizedIp,
      metadata: {
        attempts: 20,
        windowSeconds: WINDOW_SECONDS,
      },
    });
  }

  return {
    allowed,
    count,
    resetAt: Date.now() + WINDOW_SECONDS * 1000,
  };
}
