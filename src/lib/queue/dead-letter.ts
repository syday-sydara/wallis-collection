// lib/queue/dead-letter.ts
import { addJob } from "./add-job";
import { logger } from "../logger";
import { Correlation } from "../correlation";

const DLQ_SUFFIX = "-dlq";

export function getDeadLetterQueueName(queueName: string) {
  return `${queueName}${DLQ_SUFFIX}`;
}

interface DeadLetterPayload {
  dlqVersion: number;
  timestamp: number;
  retryable: boolean;

  originalQueue: string;
  originalJobName: string;
  originalPayload: any;

  // Full correlation context
  traceId?: string | null;
  requestId?: string | null;
  spanId?: string | null;
  sessionId?: string | null;
  orderId?: string | null;
  customerId?: string | null;
  workflowId?: string | null;

  dlqReason?: string;

  error: {
    message: string;
    code?: string;
    stack?: string;
  };

  attemptsMade: number;
  maxAttempts: number;
}

export async function routeToDeadLetter(options: {
  queueName: string;
  jobName: string;
  payload: any;
  error: any;
  attemptsMade: number;
  maxAttempts: number;
}) {
  const { queueName, jobName, payload, error, attemptsMade, maxAttempts } =
    options;

  const dlqName = getDeadLetterQueueName(queueName);
  const ctx = Correlation.get();

  const dlqPayload: DeadLetterPayload = {
    dlqVersion: 1,
    timestamp: Date.now(),
    retryable: attemptsMade < maxAttempts,

    originalQueue: queueName,
    originalJobName: jobName,
    originalPayload: payload,

    // Full correlation context
    traceId: ctx.traceId ?? payload?.traceId ?? null,
    requestId: ctx.requestId ?? null,
    spanId: ctx.spanId ?? null,
    sessionId: ctx.sessionId ?? null,
    orderId: ctx.orderId ?? null,
    customerId: ctx.customerId ?? null,
    workflowId: ctx.workflowId ?? null,

    dlqReason: error?.code ?? "UNKNOWN",

    error: {
      message: error?.message ?? "Unknown error",
      code: error?.code,
      stack: error?.stack,
    },

    attemptsMade,
    maxAttempts,
  };

  logger.error("Routing job to dead-letter queue", {
    queueName,
    jobName,
    dlqName,
    attemptsMade,
    maxAttempts,
    error: error?.message,
  });

  // DLQ job name is namespaced to avoid collisions
  const dlqJobName = `${jobName}__dlq`;

  await addJob(dlqName, dlqJobName, dlqPayload, {
    removeOnComplete: false,
    removeOnFail: false,
  });
}
