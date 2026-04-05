// lib/logger.ts

type LogLevel = "info" | "warn" | "error";

interface LogEventBase {
  event: string;
  level: LogLevel;
  timestamp: string;
  version: number;
  context?: string;
  env?: string;
}

/**
 * Structured logger with optional enrichment, sampling, and custom routing.
 */
export function logEvent(
  event: string,
  data: Record<string, any> = {},
  level: LogLevel = "info",
  options?: {
    context?: string;
    sampleRate?: number; // 0–1
    logger?: (msg: string) => void;
    silent?: boolean; // useful for tests
  }
) {
  const { context, sampleRate = 1, logger, silent = false } = options ?? {};

  // Sampling
  if (Math.random() > sampleRate) return;

  const version = 1;

  const payload: LogEventBase & Record<string, any> = {
    event,
    level,
    version,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    ...(context ? { context } : {}),
    ...data,
  };

  // Safe serialization
  let serialized = "";
  try {
    serialized = JSON.stringify(payload);
  } catch {
    serialized = JSON.stringify({
      event,
      level,
      timestamp: new Date().toISOString(),
      error: "Failed to serialize log payload",
    });
  }

  if (silent) return;

  const output =
    logger ??
    (level === "warn"
      ? console.warn
      : level === "error"
      ? console.error
      : console.log);

  output(serialized);
}