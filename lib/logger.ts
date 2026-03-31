// lib/logger.ts

type LogLevel = "info" | "warn" | "error";

interface LogEventBase {
  event: string;
  level: LogLevel;
  timestamp: string;
}

/**
 * Logs a structured event to the console (JSON).
 * You can later swap console.log with Sentry, Datadog, or any logging backend.
 */
export function logEvent(
  event: string,
  data: Record<string, any> = {},
  level: LogLevel = "info"
) {
  const payload: LogEventBase & Record<string, any> = {
    event,
    level,
    timestamp: new Date().toISOString(),
    ...data,
  };

  // Use appropriate console method for level
  switch (level) {
    case "warn":
      console.warn(JSON.stringify(payload));
      break;
    case "error":
      console.error(JSON.stringify(payload));
      break;
    default:
      console.log(JSON.stringify(payload));
  }
}