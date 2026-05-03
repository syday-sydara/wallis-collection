// lib/logger.ts
export const logger = {
  info: (msg, meta) => console.log(msg, meta),
  warn: (msg, meta) => console.warn(msg, meta),
  error: (msg, meta) => console.error(msg, meta),
};
