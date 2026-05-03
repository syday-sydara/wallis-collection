// lib/correlation.ts
import { AsyncLocalStorage } from "async_hooks";
import { randomUUID } from "crypto";

export interface CorrelationContext {
  traceId: string;
  requestId?: string;
  spanId?: string;
}

const storage = new AsyncLocalStorage<CorrelationContext>();

export const Correlation = {
  run<T>(ctx: CorrelationContext, fn: () => T) {
    return storage.run(ctx, fn);
  },

  get(): CorrelationContext {
    return storage.getStore() ?? { traceId: randomUUID() };
  },

  withSpan<T>(fn: () => T) {
    const parent = Correlation.get();
    const spanId = randomUUID();
    return storage.run({ ...parent, spanId }, fn);
  },
};
