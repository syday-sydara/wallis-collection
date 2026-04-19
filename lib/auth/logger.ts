import { emitSecurityEvent } from "@/lib/events/emitter";
import { SECURITY_EVENT_TYPES, type SecurityEventType } from "@/lib/events/types";

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

function normalizeContext(ctx?: string) {
  if (!ctx) return undefined;
  return ctx.toLowerCase().replace(/[^a-z0-9_\-]/g, "").slice(0, 40);
}

function clampSampleRate(rate: number) {
  if (rate <= 0) return 0;
  if (rate >= 1) return 1;
  return rate;
}

function safeClone<T>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return {} as T;
  }
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

  const normalizedContext = normalizeContext(context);
  const rate = clampSampleRate(sampleRate);

  // Sampling
  if (Math.random() > rate) return;

  const version = 1;

  const payload: LogEventBase & Record<string, any> = {
    event,
    level,
    version,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    requestId,
    source,
    ...(normalizedContext ? { context: normalizedContext } : {}),
    ...safeClone(data),
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

  const securityType: SecurityEventType = SECURITY_EVENT_TYPES.includes(
    event as SecurityEventType
  )
    ? (event as SecurityEventType)
    : "SYSTEM_ANOMALY";

  // Non-blocking
  void emitSecurityEvent({
    type: securityType,
    message: `Log event: ${event}`,
    severity: mapLevelToSeverity(level),
    category: normalizedContext ?? "system",
    ip,
    userAgent,
    requestId,
    source,
    metadata: limitMetadataSize(payload),
  });
}
