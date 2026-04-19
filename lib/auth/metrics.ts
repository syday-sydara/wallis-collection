// lib/auth/metrics.ts

import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";

const VERSION = 1;

function classifyDuration(durationMs: number): "low" | "medium" | "high" {
  if (durationMs >= 1500) return "high";
  if (durationMs >= 500) return "medium";
  return "low";
}

function clampSampleRate(rate: number) {
  if (rate <= 0) return 0;
  if (rate >= 1) return 1;
  return rate;
}

function limitMetadataSize(obj: any, maxBytes = 5000) {
  try {
    const json = JSON.stringify(obj);
    if (json.length > maxBytes) {
      return { truncated: true };
    }
    return obj;
  } catch {
    return { error: "metadata_serialization_failed" };
  }
}

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

    // Sampling
    if (Math.random() > rate) return durationMs;

    const payload = {
      version: VERSION,
      metric: label,
      durationMs,
      timestamp: new Date().toISOString(),
      env,
      ...metadata,
      ...extra,
    };

    /* -------------------------------------------------- */
    /* Console / custom logger                             */
    /* -------------------------------------------------- */
    if (!silent) {
      try {
        logger(JSON.stringify(payload));
      } catch {
        try {
          logger(
            JSON.stringify({
              version: VERSION,
              metric: label,
              durationMs,
              timestamp: new Date().toISOString(),
              env,
              error: "Failed to serialize metric payload",
            })
          );
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
