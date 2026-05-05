// lib/queue/worker-wrapper.ts
import { Correlation } from "../correlation";

export function withCorrelation(handler) {
  return async (job) => {
    const ctxFromJob = extractCorrelation(job.data);

    // Create a new span for this specific worker execution
    return Correlation.run(ctxFromJob, () =>
      Correlation.withSpan(async () => {
        return handler(job);
      })
    );
  };
}

function extractCorrelation(data: any) {
  if (!data) return Correlation.get();

  const {
    traceId,
    requestId,
    spanId,
    sessionId,
    orderId,
    customerId,
    workflowId
  } = data;

  return {
    ...Correlation.get(),
    traceId,
    requestId,
    spanId,
    sessionId,
    orderId,
    customerId,
    workflowId,
  };
}
