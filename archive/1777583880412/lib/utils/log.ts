// lib/core/log.ts

import { logger as baseLogger } from "./logger";
import { serviceContext } from "./service-context";

function normalizeMeta(meta: any) {
  if (!meta) return {};

  // Normalize Error objects
  if (meta instanceof Error) {
    return {
      error: {
        name: meta.name,
        message: meta.message,
        stack: meta.stack,
      },
    };
  }

  // Normalize nested error fields
  if (meta.error instanceof Error) {
    return {
      ...meta,
      error: {
        name: meta.error.name,
        message: meta.error.message,
        stack: meta.error.stack,
      },
    };
  }

  return meta;
}

function mergeMeta(meta: any) {
  const ctx = serviceContext.get();
  return { ...ctx, ...normalizeMeta(meta) };
}

export const log = {
  debug(message: string, meta: any = {}) {
    baseLogger.debug(message, mergeMeta(meta));
  },

  info(message: string, meta: any = {}) {
    baseLogger.info(message, mergeMeta(meta));
  },

  warn(message: string, meta: any = {}) {
    baseLogger.warn(message, mergeMeta(meta));
  },

  error(message: string, meta: any = {}) {
    baseLogger.error(message, mergeMeta(meta));
  },

  fatal(message: string, meta: any = {}) {
    baseLogger.error(message, mergeMeta({ level: "fatal", ...meta }));
  },

  /**
   * Sampled logging — useful for noisy events.
   * Example: log.sample(0.1).debug("noisy event");
   */
  sample(rate: number) {
    const clamped = Math.min(Math.max(rate, 0), 1);
    const shouldLog = Math.random() < clamped;

    return shouldLog ? log : silentLogger;
  },

  /**
   * Child logger — attach fixed metadata for a domain or component.
   * Example:
   *   const orderLog = log.child({ domain: "order", orderId });
   *   orderLog.info("Order created");
   */
  child(extra: Record<string, any>) {
    return {
      debug: (msg: string, meta: any = {}) =>
        log.debug(msg, { ...extra, ...meta }),
      info: (msg: string, meta: any = {}) =>
        log.info(msg, { ...extra, ...meta }),
      warn: (msg: string, meta: any = {}) =>
        log.warn(msg, { ...extra, ...meta }),
      error: (msg: string, meta: any = {}) =>
        log.error(msg, { ...extra, ...meta }),
      fatal: (msg: string, meta: any = {}) =>
        log.fatal(msg, { ...extra, ...meta }),
    };
  },
};

// Used when sampling decides not to log
const silentLogger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
  fatal() {},
  child() {
    return silentLogger;
  },
};
