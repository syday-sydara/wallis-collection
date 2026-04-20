// lib/auth/permission-rate.ts
import { redis } from "@/lib/redis";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";

const WINDOW_SECONDS = 10 * 60; // 10 minutes
const MAX = 20;

/* -------------------------------------------------- */
/* Helpers                                             */
/* -------------------------------------------------- */

function normalizeIp(ip: string | null): string {
  if (!ip) return "unknown";

  let clean = ip.split(",")[0].trim();

  // Remove port
  clean = clean.replace(/:\d+$/, "");

  // IPv6 localhost
  if (clean === "::1") return "127.0.0.1";

  // IPv4-mapped IPv6
  const ipv4Match = clean.match(/::ffff:(\d+\.\d+\.\d+\.\d+)/);
  if (ipv4Match) clean = ipv4Match[1];

  // Prevent Redis key injection
  clean = clean.replace(/[^a-zA-Z0-9\.\:]/g, "");

  return clean || "unknown";
}

function limitMetadataSize(obj: any, maxBytes = 5000) {
  try {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json).length;

    if (bytes > maxBytes) {
      return {
        truncated: true,
        preview: json.slice(0, 2000),
        originalBytes: bytes,
      };
    }

    return obj;
  } catch {
    return { error: "metadata_serialization_failed" };
  }
}

/* -------------------------------------------------- */
/* Main API                                            */
/* -------------------------------------------------- */

/**
 * Tracks permission-denied attempts per IP.
 * Returns { allowed, count, resetAt }.
 */
export async function trackPermissionDenied(ip: string | null) {
  const normalized = normalizeIp(ip);
  const key = `perm:denied:${normalized}`;

  try {
    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, WINDOW_SECONDS);

    const results = await pipeline.exec();

    const count = Number(results?.[0]?.[1] ?? 1);
    const safeCount = Number.isFinite(count) ? count : MAX + 1;

    const allowed = safeCount <= MAX;

    /* -------------------------------------------------- */
    /* Security Event Logging                              */
    /* -------------------------------------------------- */
    void emitSecurityEvent({
      type: "PERMISSION_DENIED_RATE",
      message: `Permission denied count for ${normalized}: ${safeCount}`,
      severity: allowed ? "low" : "medium",
      category: "auth",
      ip: normalized,
      metadata: limitMetadataSize({
        count: safeCount,
        max: MAX,
        windowSeconds: WINDOW_SECONDS,
      }),
    });

    /* -------------------------------------------------- */
    /* Abuse Alert                                         */
    /* -------------------------------------------------- */
    if (!allowed) {
      void emitAlertEvent({
        event: "PERMISSION_DENIED_ABUSE",
        ip: normalized,
        metadata: {
          count: safeCount,
          max: MAX,
          windowSeconds: WINDOW_SECONDS,
        },
      });
    }

    return {
      allowed,
      count: safeCount,
      resetAt: Date.now() + WINDOW_SECONDS * 1000,
    };
  } catch (err) {
    console.error("Redis unavailable for permission rate-limit:", err);

    // Fail-open but still emit a security event
    void emitSecurityEvent({
      type: "PERMISSION_RATE_REDIS_FAILURE",
      message: "Redis unavailable for permission rate-limit",
      severity: "medium",
      category: "infra",
      ip: normalized,
      metadata: limitMetadataSize({ error: String(err) }),
    });

    return {
      allowed: true,
      count: 1,
      resetAt: Date.now() + WINDOW_SECONDS * 1000,
    };
  }
}
