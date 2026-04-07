// lib/security/permission-rate.ts

import { redis } from "@/lib/redis";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/security/eventBus";

const WINDOW_SECONDS = 10 * 60; // 10 minutes
const MAX = 20;

function normalizeIp(ip: string) {
  return ip.split(",")[0].trim();
}

export async function trackPermissionDenied(ip: string) {
  const normalizedIp = normalizeIp(ip);
  const key = `perm:denied:${normalizedIp}`;

  let count = 1;

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
    severity: count >= 20 ? "high" : count >= 10 ? "medium" : "low",
    ip: normalizedIp,
    category: "auth",
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
      event: "PERMISSION_DENIED_THRESHOLD_MEDIUM",
      ip: normalizedIp,
      metadata: {
        attempts: 10,
        windowSeconds: WINDOW_SECONDS,
      },
    });
  }

  if (count === 20) {
    await emitAlertEvent({
      event: "PERMISSION_DENIED_THRESHOLD_HIGH",
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
