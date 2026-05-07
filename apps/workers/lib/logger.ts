// lib/logger.ts
import { Correlation } from "./correlation";

export const logger = {
  info: (msg: string, meta: Record<string, any> = {}) =>
    log("info", msg, meta),

  warn: (msg: string, meta: Record<string, any> = {}) =>
    log("warn", msg, meta),

  error: (msg: string, meta: Record<string, any> = {}) =>
    log("error", msg, meta),
};

function log(level: string, msg: string, meta: Record<string, any>) {
  const ctx = Correlation.get();

  const entry = {
    // ------------------------------------------------------
    // Core log fields
    // ------------------------------------------------------
    level,
    message: msg,
    timestamp: new Date().toISOString(),

    // ------------------------------------------------------
    // Correlation context (full)
    // ------------------------------------------------------
    traceId: ctx.traceId,
    requestId: ctx.requestId,
    spanId: ctx.spanId,
    parentSpanId: ctx.parentSpanId,

    sessionId: ctx.sessionId,
    orderId: ctx.orderId,
    customerId: ctx.customerId,
    workflowId: ctx.workflowId,

    // ------------------------------------------------------
    // User-supplied metadata
    // ------------------------------------------------------
    ...meta,
  };

  // ------------------------------------------------------
  // Safe JSON output (prevents circular structure crashes)
  // ------------------------------------------------------
  try {
    console.log(JSON.stringify(entry));
  } catch (err) {
    console.log(
      JSON.stringify({
        level: "error",
        message: "Failed to serialize log entry",
        originalMessage: msg,
        error: String(err),
        timestamp: new Date().toISOString(),
        traceId: ctx.traceId,
      })
    );
  }
}
