// lib/logger.ts
import { Correlation } from "./correlation";

export const logger = {
  info: (msg, meta = {}) => log("info", msg, meta),
  warn: (msg, meta = {}) => log("warn", msg, meta),
  error: (msg, meta = {}) => log("error", msg, meta),
};

function log(level: string, msg: string, meta: Record<string, any>) {
  const ctx = Correlation.get();

  const entry = {
    level,
    message: msg,
    timestamp: new Date().toISOString(),

    // Full correlation context
    traceId: ctx.traceId,
    requestId: ctx.requestId,
    spanId: ctx.spanId,
    sessionId: ctx.sessionId,
    orderId: ctx.orderId,
    customerId: ctx.customerId,
    workflowId: ctx.workflowId,

    ...meta,
  };

  console.log(JSON.stringify(entry));
}
