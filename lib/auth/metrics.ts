// lib/auth/metrics.ts

import { emitSecurityEvent, emitAlertEvent } from "@/lib/security/eventBus";

const VERSION = 1;

function classifyDuration(durationMs: number): "low" | "medium" | "high" {
  if (durationMs >= 1500) return "high";
  if (durationMs >= 500) return "medium";
  return "low";
}

/**
 * v3 Security Center integrated performance timer.
 */
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

  return async (extra: Record<string, any> = {}) => {
    const end =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    const durationMs = end - start;

    // Sampling
    if (Math.random() > sampleRate) return durationMs;

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
      }
    }

    /* -------------------------------------------------- */
    /* SecurityEvent (dashboard visibility)                */
    /* -------------------------------------------------- */
    const severity = classifyDuration(durationMs);

    await emitSecurityEvent({
      type: "PERFORMANCE_METRIC",
      message: `Metric ${label} took ${durationMs.toFixed(1)}ms`,
      severity,
      category: "performance",
      ip,
      userAgent,
      requestId,
      source,
      metadata: {
        metric: label,
        durationMs,
        ...metadata,
        ...extra,
      },
    });

    /* -------------------------------------------------- */
    /* AlertEvent (slow operations)                        */
    /* -------------------------------------------------- */
    if (severity === "high") {
      await emitAlertEvent({
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
