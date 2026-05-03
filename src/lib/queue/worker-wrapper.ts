// lib/queue/worker-wrapper.ts
import { Correlation } from "../correlation";

export function withCorrelation(handler) {
  return async (job) => {
    const ctx = {
      traceId: job.data.traceId ?? job.id,
      spanId: job.id,
    };

    return Correlation.run(ctx, () => handler(job));
  };
}
