// lib/logger.ts

type LogLevel = "info" | "warn" | "error";

type LogEventBase = {
  event: string;
  level?: LogLevel;
  timestamp?: string;
};

export function logEvent(
  event: string,
  data: Record<string, any> = {},
  level: LogLevel = "info"
) {
  const payload: LogEventBase & Record<string, any> = {
    event,
    level,
    timestamp: new Date().toISOString(),
    ...data
  };

  // Single line JSON for log aggregation
  console.log(JSON.stringify(payload));
}
