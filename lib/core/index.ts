// lib/core/index.ts

// Core primitives
export { logger } from "./logger";
export { log } from "./log";
export { metrics } from "./metrics";
export { metricsWithContext } from "./metrics-context";
export { events, setEventDebugHook } from "./events";
export { startSpan, getTrace, clearTraces } from "./tracing";
export { serviceContext } from "./service-context";

// Errors
export {
  AppError,
  ValidationError,
  AuthError,
  NotFoundError,
  BadRequestError,
  RateLimitError,
  ExternalServiceError,
  isAppError,
  wrapError,
} from "./errors";

// Config
export { config } from "./config";

// Observability wrapper
export { withObservability } from "./with-observability";

/**
 * Optional bootstrap helper.
 * Call this once at server startup (e.g., in Next.js middleware or root layout).
 */
export function bootstrapCore() {
  const { logger } = require("./logger");
  const { config } = require("./config");

  logger.info("Core services initialized", {
    env: config.env,
    metricsEnabled: config.metrics.enabled,
    traceSampling: config.tracing.samplingRate,
  });
}
