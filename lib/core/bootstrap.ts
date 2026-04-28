// lib/core/bootstrap.ts

import { config } from "./config";
import { logger } from "./logger";
import { setEventDebugHook } from "./events";
import { metrics } from "./metrics";
import { serviceContext } from "./service-context";

let initialized = false;

export function bootstrap() {
  if (initialized) return;
  initialized = true;

  // Attach a temporary context for bootstrap logs
  serviceContext.run(
    { requestId: "bootstrap", traceId: "bootstrap" },
    () => {
      logger.info("Bootstrapping core services...", {
        env: config.env,
        metricsEnabled: config.metrics.enabled,
        traceSampling: config.tracing.samplingRate,
      });

      // Optional: enable event debug logging in development
      if (config.isDev) {
        setEventDebugHook((event, payload) => {
          logger.debug("Event fired", { event, payload });
        });
      }

      // Emit a startup metric
      if (config.metrics.enabled) {
        metrics.increment("system.startup");
      }

      logger.info("Core services initialized successfully");
    }
  );
}
