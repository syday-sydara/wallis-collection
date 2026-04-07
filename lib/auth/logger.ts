import { emitSecurityEvent } from "@/lib/events/emitter";

type LogLevel = "info" | "warn" | "error";

interface LogEventBase {
  event: string;
  level: LogLevel;
  timestamp: string;
  version: number;
  context?: string;
  env?: string;
  requestId?: string | null;
  source?: string | null;
}

function mapLevelToSeverity(level: LogLevel): "low" | "medium" | "high" {
  switch (level) {
    case "error":
      return "high";
    case "warn":
      return "medium";
    default:
      return "low";
  }
}

/**
 * Structured logger with Security Center integration.
 */
export async function logEvent(
  event: string,
  data: Record<string, any> = {},
  level: LogLevel = "info",
  options?: {
    context?: string;
    sampleRate?: number;
    logger?: (msg: string) => void;
    silent?: boolean;
    requestId?: string | null;
    source?: string | null;
    ip?: string | null;
    userAgent?: string | null;
  }
) {
  const {
    context,
    sampleRate = 1,
    logger,
    silent = false,
    requestId = null,
    source = "app",
    ip = null,
    userAgent = null,
  } = options ?? {};

  // Sampling
  if (Math.random() > sampleRate) return;

  const version = 1;

  const payload: LogEventBase & Record<string, any> = {
    event,
    level,
    version,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    requestId,
    source,
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

  if (!silent) {
    const output =
      logger ??
      (level === "warn"
        ? console.warn
        : level === "error"
        ? console.error
        : console.log);

    output(serialized);
  }

  /* -------------------------------------------------- */
  /* Security Center Integration                         */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: event,
    message: `Log event: ${event}`,
    severity: mapLevelToSeverity(level),
    category: context ?? "system",
    ip,
    userAgent,
    requestId,
    source,
    metadata: payload,
  });
}
