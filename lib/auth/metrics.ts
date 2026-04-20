// lib/auth/metrics.ts

import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";

const VERSION = 1;

/* -------------------------------------------------- */
/* Helpers                                             */
/* -------------------------------------------------- */

function classifyDuration(durationMs: number): "low" | "medium" | "high" {
  if (durationMs >= 1500) return "high";
  if (durationMs >= 500) return "medium";
  return "low";
}

function clampSampleRate(rate: number) {
  return Math.min(1, Math.max(0, rate));
}

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function deterministicSample(requestId: string, rate: number) {
  const h = hashString(requestId) % 10000;
  return h / 10000 <= rate;
}

function safeClone<T>(obj: T): T {
  try {
    if (obj instanceof Error) {
      return {
        name: obj.name,
        message: obj.message,
        stack: obj.stack,
      } as T;
    }
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return { error: "clone_failed" } as T;
  }
}

function utf8ByteLength(str: string) {
  return new TextEncoder().encode(str).length;
}

function limitMetadataSize(obj: any, maxBytes = 5000) {
  try {
    const json = JSON.stringify(obj);
    const bytes = utf8ByteLength(json);

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

export function startTimer(
  label: string,
  options?: {
    metadata?: Record<string, any>;
    sampleRate?: number;
    logger?: (payload: any) => void;
    silent?: boolean;
    requestId?: string | null;
    source?: string | null;
    ip?: string | null;
    userAgent?: string | null;
  }
) {
  const start =
    typeof performance !== "undefined" ? performance.now() : Date.now();

  const {
    metadata = {},
    sampleRate = 1,
    logger = console.log,
    silent = false,
    requestId = null,
    source = "app",
    ip = null,
    userAgent = null,
  } = options ?? {};

  const env = process.env.NODE_ENV;
  const rate = clampSampleRate(sampleRate);

  return async (extra: Record<string, any> = {}) => {
    const end =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    const durationMs = end - start;

    /* -------------------------------------------------- */
    /* Sampling (deterministic when requestId exists)      */
    /* -------------------------------------------------- */
    if (requestId) {
      if (!deterministicSample(requestId, rate)) return durationMs;
    } else {
      if (Math.random() > rate) return durationMs;
    }

    const payload = {
      version: VERSION,
      metric: label,
      durationMs,
      timestamp: new Date().toISOString(),
      env,
      ...safeClone(metadata),
      ...safeClone(extra),
    };

    /* -------------------------------------------------- */
    /* Console / custom logger                             */
    /* -------------------------------------------------- */
    if (!silent) {
      try {
        logger(payload); // structured logging
      } catch {
        try {
          logger({
            version: VERSION,
            metric: label,
            durationMs,
            timestamp: new Date().toISOString(),
            env,
            error: "Failed to serialize metric payload",
          });
        } catch {
          // swallow logger failures
        }
      }
    }

    /* -------------------------------------------------- */
    /* SecurityEvent (dashboard visibility)                */
    /* -------------------------------------------------- */
    const severity = classifyDuration(durationMs);

    void emitSecurityEvent({
      type: "PERFORMANCE_METRIC",
      message: `Metric ${label} took ${durationMs.toFixed(1)}ms`,
      severity,
      category: "performance",
      ip,
      userAgent,
      requestId,
      source,
      metadata: limitMetadataSize({
        metric: label,
        durationMs,
        ...metadata,
        ...extra,
      }),
    });

    /* -------------------------------------------------- */
    /* AlertEvent (slow operations)                        */
    /* -------------------------------------------------- */
    if (severity === "high") {
      void emitAlertEvent({
        event: "PERFORMANCE_SLOW_OPERATION",
        ip,
        userAgent,
        metadata: {
          metric: label,
          durationMs,
          threshold: "1500ms",
        },
      });
    }

    return durationMs;
  };
}
