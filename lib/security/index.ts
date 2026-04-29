// lib/core/index.ts

export const serviceContext = {
  get() {
    return {
      ip: null as string | null,
      userAgent: null as string | null,
      traceId: null as string | null,
      requestId: null as string | null,
    };
  },
};

export function startSpan(name: string, attrs?: Record<string, any>) {
  return {
    end(data?: Record<string, any>) {
      // no-op stub
    },
  };
}

export const metricsWithContext = {
  increment(name: string) {
    // no-op stub
  },
};

export const log = {
  error(message: string, meta?: any) {
    // eslint-disable-next-line no-console
    console.error(message, meta);
  },
  info(message: string, meta?: any) {
    // eslint-disable-next-line no-console
    console.log(message, meta);
  },
};
