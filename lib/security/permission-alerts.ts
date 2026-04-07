// lib/security/permission-alerts.ts

import { redis } from "@/lib/redis";
import { emitAlertEvent, emitSecurityEvent } from "@/lib/security/eventBus";

const VERSION = 1;

function normalizeIp(ip: string) {
  return ip.split(",")[0].trim();
}

export async function maybeSendUnauthorizedAlert(ip: string, count: number) {
  const normalizedIp = normalizeIp(ip);

  /* -------------------------------------------------- */
  /* Rate-limit alerts per IP (v3 unified pattern)       */
  /* -------------------------------------------------- */
  let throttled = false;

  try {
    const rlKey = `alert:unauth:${normalizedIp}`;
    const hits = await redis.incr(rlKey);

    if (hits === 1) {
      await redis.expire(rlKey, 60); // 1-minute window
    }

    throttled = hits > 3;
  } catch {
    // Redis unavailable — continue without rate limiting
  }

  if (throttled) return;

  /* -------------------------------------------------- */
  /* Emit SecurityEvent (dashboard visibility)           */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "UNAUTHORIZED_ACCESS_ATTEMPT",
    message: `Unauthorized access attempts from ${normalizedIp}: ${count}`,
    severity: count >= 10 ? "high" : "medium",
    ip: normalizedIp,
    category: "auth",
    metadata: {
      version: VERSION,
      attempts: count,
    },
  });

  /* -------------------------------------------------- */
  /* Threshold-based AlertEvent                          */
  /* -------------------------------------------------- */
  if (count === 5) {
    await emitAlertEvent({
      event: "UNAUTHORIZED_ACCESS_WARNING",
      ip: normalizedIp,
      metadata: {
        attempts: 5,
        version: VERSION,
      },
    });
  }

  if (count === 10) {
    await emitAlertEvent({
      event: "UNAUTHORIZED_ACCESS_CRITICAL",
      ip: normalizedIp,
      metadata: {
        attempts: 10,
        version: VERSION,
      },
    });
  }
}
