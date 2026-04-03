// lib/logger.ts

type LogLevel = "info" | "warn" | "error";

interface LogEventBase {
  event: string;
  level: LogLevel;
  timestamp: string;
}

/**
 * Logs a structured event to the console (JSON).
 * Can be swapped with Sentry, Datadog, Logtail, or any backend later.
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
    ...data
  };

  const serialized = JSON.stringify(payload);

  switch (level) {
    case "warn":
      console.warn(serialized);
      break;
    case "error":
      console.error(serialized);
      break;
    default:
      console.log(serialized);
  }
}
