// lib/security/index.ts

import crypto from "crypto";

/* -------------------------------------------------- */
/* Request-scoped context                              */
/* -------------------------------------------------- */

type ServiceContext = {
  ip: string | null;
  userAgent: string | null;
  traceId: string;
  requestId: string;
  metadata: Record<string, any>;
};

let currentContext: ServiceContext | null = null;

export const serviceContext = {
  start(initial: Partial<ServiceContext> = {}) {
    currentContext = {
      ip: initial.ip ?? null,
      userAgent: initial.userAgent ?? null,
      traceId: initial.traceId ?? crypto.randomUUID(),
      requestId: initial.requestId ?? crypto.randomUUID(),
      metadata: initial.metadata ?? {},
    };
  },

  get(): ServiceContext {
    if (!currentContext) {
      // Fallback context for non-request code paths
      currentContext = {
        ip: null,
        userAgent: null,
        traceId: crypto.randomUUID(),
        requestId: crypto.randomUUID(),
        metadata: {},
      };
    }
    return currentContext;
  },

  setMeta(key: string, value: any) {
    const ctx = serviceContext.get();
    ctx.metadata[key] = value;
  },
};

/* -------------------------------------------------- */
/* Spans (timing blocks of work)                       */
/* -------------------------------------------------- */

export function startSpan(name: string, attrs?: Record<string, any>) {
  const start = Date.now();
  const ctx = serviceContext.get();

  return {
    end(extra?: Record<string, any>) {
      const duration = Date.now() - start;

      log.info(`span:${name}`, {
        durationMs: duration,
        traceId: ctx.traceId,
        requestId: ctx.requestId,
        ...attrs,
        ...extra,
      });
    },
  };
}

/* -------------------------------------------------- */
/* Metrics (stub but structured)                       */
/* -------------------------------------------------- */

export const metricsWithContext = {
  increment(name: string, value = 1) {
    const ctx = serviceContext.get();

    log.info(`metric:${name}`, {
      value,
      traceId: ctx.traceId,
      requestId: ctx.requestId,
    });
  },
};

/* -------------------------------------------------- */
/* Structured logging                                  */
/* -------------------------------------------------- */

export const log = {
  error(message: string, meta?: any) {
    const ctx = serviceContext.get();
    console.error(message, {
      level: "error",
      traceId: ctx.traceId,
      requestId: ctx.requestId,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      ...ctx.metadata,
      ...meta,
    });
  },

  info(message: string, meta?: any) {
    const ctx = serviceContext.get();
    console.log(message, {
      level: "info",
      traceId: ctx.traceId,
      requestId: ctx.requestId,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      ...ctx.metadata,
      ...meta,
    });
  },
};
