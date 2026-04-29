// lib/core/logger.ts

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: any;
}

const isProd = process.env.NODE_ENV === "production";

/* -------------------------------------------------- */
/* Color helpers (dev only)                            */
/* -------------------------------------------------- */

const colors = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  debug: "\x1b[36m", // cyan
  info: "\x1b[32m", // green
  warn: "\x1b[33m", // yellow
  error: "\x1b[31m", // red
  fatal: "\x1b[41m\x1b[37m", // white on red
};

function colorize(level: LogLevel, text: string) {
  const color = colors[level] ?? colors.reset;
  return `${color}${text}${colors.reset}`;
}

/* -------------------------------------------------- */
/* Formatters                                          */
/* -------------------------------------------------- */

function formatDev(payload: LogPayload) {
  const { level, message, timestamp, ...meta } = payload;

  const levelTag = colorize(level, level.toUpperCase().padEnd(5));
  const timeTag = colors.dim + timestamp + colors.reset;

  if (Object.keys(meta).length === 0) {
    return `${timeTag} ${levelTag} ${message}`;
  }

  return `${timeTag} ${levelTag} ${message} ${colors.dim}${JSON.stringify(
    meta,
    null,
    2
  )}${colors.reset}`;
}

function formatProd(payload: LogPayload) {
  return JSON.stringify(payload);
}

/* -------------------------------------------------- */
/* Base logger                                         */
/* -------------------------------------------------- */

function log(level: LogLevel, message: string, meta: any = {}) {
  const payload: LogPayload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  if (isProd) {
    console.log(formatProd(payload));
  } else {
    console.log(formatDev(payload));
  }
}

export const logger = {
  debug: (msg: string, meta?: any) => log("debug", msg, meta),
  info: (msg: string, meta?: any) => log("info", msg, meta),
  warn: (msg: string, meta?: any) => log("warn", msg, meta),
  error: (msg: string, meta?: any) => log("error", msg, meta),
  fatal: (msg: string, meta?: any) => log("fatal", msg, meta),
};
