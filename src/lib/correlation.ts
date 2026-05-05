// lib/correlation.ts
import { AsyncLocalStorage } from "async_hooks";
import { randomUUID } from "crypto";

export interface CorrelationContext {
  traceId: string;
  requestId?: string;
  spanId?: string;

  // Extended correlation fields
  sessionId?: string;
  orderId?: string;
  customerId?: string;
  workflowId?: string;

  // Allow future fields without code changes
  [key: string]: any;
}

const storage = new AsyncLocalStorage<CorrelationContext>();

export const Correlation = {
  run<T>(ctx: CorrelationContext, fn: () => T) {
    return storage.run(ctx, fn);
  },

  get(): CorrelationContext {
    const existing = storage.getStore();
    if (existing) return existing;

    // Default context when none exists
    return {
      traceId: randomUUID(),
      spanId: randomUUID(),
    };
  },

  withSpan<T>(fn: () => T) {
    const parent = Correlation.get();
    const spanId = randomUUID();

    return storage.run(
      {
        ...parent,
        spanId,
      },
      fn
    );
  },

  // Optional helper: merge new fields into current context
  extend(fields: Record<string, any>) {
    const parent = Correlation.get();
    storage.enterWith({ ...parent, ...fields });
  },
};
