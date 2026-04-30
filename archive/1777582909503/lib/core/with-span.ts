// lib/core/with-span.ts

import { startSpan } from "./tracing";
import { serviceContext } from "./service-context";

export function withSpan<TArgs extends any[], TReturn>(
  name: string,
  fn: (...args: TArgs) => Promise<TReturn> | TReturn,
) {
  return async (...args: TArgs): Promise<TReturn> => {
    const ctx = serviceContext.get();

    const span = startSpan(name, {
      requestId: ctx.requestId,
      userId: ctx.userId,
      sessionId: ctx.sessionId,
      traceId: ctx.traceId,
    });

    try {
      const result = await fn(...args);
      span.end({ success: true });
      return result;
    } catch (err: any) {
      span.end({
        success: false,
        error: err?.message,
        stack: err?.stack,
      });
      throw err;
    }
  };
}
