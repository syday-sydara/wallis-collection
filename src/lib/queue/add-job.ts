// lib/queue/add-job.ts
import { Correlation } from "../correlation";

export function addJob(queue, name, payload, opts = {}) {
  const ctx = Correlation.get();

  return queue.add(
    name,
    {
      ...payload,
      traceId: ctx.traceId,
      requestId: ctx.requestId,
      spanId: ctx.spanId,
    },
    opts
  );
}
