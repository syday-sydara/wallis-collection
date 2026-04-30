// lib/core/service-context.ts

import { AsyncLocalStorage } from "node:async_hooks";
import os from "os";

export interface ServiceContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  locale?: string;
  traceId?: string;
  timestamp?: string;
  hostname?: string;
  [key: string]: any;
}

const storage = new AsyncLocalStorage<ServiceContext>();

function enrich(ctx: ServiceContext): ServiceContext {
  return {
    timestamp: new Date().toISOString(),
    hostname: os.hostname(),
    ...ctx,
  };
}

export const serviceContext = {
  run<T>(ctx: ServiceContext, fn: () => T) {
    return storage.run(enrich(ctx), fn);
  },

  merge(ctx: Partial<ServiceContext>) {
    const current = storage.getStore() ?? {};
    storage.enterWith({ ...current, ...ctx });
  },

  get(): ServiceContext {
    return storage.getStore() ?? {};
  },

  getOrThrow<K extends keyof ServiceContext>(key: K): ServiceContext[K] {
    const ctx = storage.getStore();
    if (!ctx || ctx[key] === undefined) {
      throw new Error(`Missing required context key: ${String(key)}`);
    }
    return ctx[key];
  },

  requireContext(): ServiceContext {
    const ctx = storage.getStore();
    if (!ctx) throw new Error("Service context not initialized");
    return ctx;
  },

  reset() {
    storage.enterWith({});
  },
};
