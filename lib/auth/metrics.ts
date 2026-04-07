// lib/auth/metrics.ts

/**
 * Starts a performance timer for a given metric label.
 * Returns a function that stops the timer, logs the duration, and returns it.
 * Supports metadata, sampling, versioning, and safe serialization.
 */
export function startTimer(
  label: string,
  options?: {
    metadata?: Record<string, any>;
    sampleRate?: number; // 0–1
    logger?: (payload: any) => void;
    silent?: boolean; // useful for tests
  }
) {
  const start = (typeof performance !== "undefined"
    ? performance.now()
    : Date.now());

  const {
    metadata = {},
    sampleRate = 1,
    logger = console.log,
    silent = false,
  } = options ?? {};

  const version = 1;
  const env = process.env.NODE_ENV;

  return (extra: Record<string, any> = {}) => {
    const end = (typeof performance !== "undefined"
      ? performance.now()
      : Date.now());

    const duration = end - start;

    // Sampling
    if (Math.random() > sampleRate) return duration;

    const payload = {
      version,
      metric: label,
      durationMs: duration,
      timestamp: new Date().toISOString(),
      env,
      ...metadata,
      ...extra,
    };

    if (!silent) {
      try {
        logger(JSON.stringify(payload));
      } catch {
        logger(
          JSON.stringify({
            version,
            metric: label,
            durationMs: duration,
            timestamp: new Date().toISOString(),
            env,
            error: "Failed to serialize metric payload",
          })
        );
      }
    }

    return duration;
  };
}