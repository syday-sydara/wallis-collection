const isDev = process.env.NODE_ENV !== "production";

function base(level: string, msg: string, meta?: Record<string, any>) {
  const timestamp = new Date().toISOString();

  if (isDev) {
    // Pretty logs for development
    const parts = [`[${level}]`, timestamp, msg];
    if (meta) parts.push(JSON.stringify(meta));
    console.log(...parts);
  } else {
    // Structured JSON logs for production
    console.log(
      JSON.stringify({
        level,
        msg,
        ...meta,
        timestamp,
      })
    );
  }
}

export const logger = {
  info: (msg: string, meta?: Record<string, any>) => base("INFO", msg, meta),
  warn: (msg: string, meta?: Record<string, any>) => base("WARN", msg, meta),
  error: (msg: string, meta?: Record<string, any>) => base("ERROR", msg, meta),
};
