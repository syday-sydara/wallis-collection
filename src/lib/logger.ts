// lib/logger.ts
import { Correlation } from "./correlation";

export const logger = {
  info: (msg, meta = {}) => log("info", msg, meta),
  warn: (msg, meta = {}) => log("warn", msg, meta),
  error: (msg, meta = {}) => log("error", msg, meta),
};

function log(level, msg, meta) {
  const ctx = Correlation.get();

  const entry = {
    level,
    message: msg,
    timestamp: new Date().toISOString(),
    traceId: ctx.traceId,
    requestId: ctx.requestId,
    spanId: ctx.spanId,
    ...meta,
  };

  console.log(JSON.stringify(entry));
}
