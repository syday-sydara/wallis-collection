import { z } from "zod";

// ------------------------------------------------------
// TRACE ID
// ------------------------------------------------------
function newTraceId() {
  const prefix = typeof window === "undefined" ? "server" : "client";
  return `${prefix}-${crypto.randomUUID()}`;
}

// ------------------------------------------------------
// ERROR TYPES
// ------------------------------------------------------
export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: any,
    public traceId?: string
  ) {
    super(message);
  }
}

export class TimeoutError extends Error {}
export class NetworkError extends Error {}
export class SchemaError extends Error {}

// ------------------------------------------------------
// RETRY LOGIC
// ------------------------------------------------------
async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries <= 0) throw err;

    const transient =
      err instanceof TimeoutError ||
      err instanceof NetworkError ||
      err.message.includes("Failed to fetch");

    if (transient) {
      await new Promise((r) => setTimeout(r, 200 * (3 - retries)));
      return withRetry(fn, retries - 1);
    }

    throw err;
  }
}

// ------------------------------------------------------
// BASE URL
// ------------------------------------------------------
const BASE =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || ""
    : window.location.origin;

// ------------------------------------------------------
// REQUEST WRAPPER
// ------------------------------------------------------
async function request<T>(
  url: string,
  options: RequestInit = {},
  schema?: z.ZodSchema<T>
): Promise<T> {
  return withRetry(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const traceId = newTraceId();

    let res: Response;

    try {
      res = await fetch(`${BASE}${url}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-trace-id": traceId,
          ...(options.headers || {}),
        },
      });
    } catch (err: any) {
      clearTimeout(timeout);

      if (err.name === "AbortError") {
        throw new TimeoutError("Request timed out");
      }

      throw new NetworkError(err.message);
    }

    clearTimeout(timeout);

    const text = await res.text();
    let json: any = null;

    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      throw new HttpError(`Invalid JSON from ${url}`, res.status, text, traceId);
    }

    if (!res.ok) {
      throw new HttpError(
        json?.message || `Request failed: ${res.status}`,
        res.status,
        json,
        traceId
      );
    }

    if (schema) {
      const parsed = schema.safeParse(json);
      if (!parsed.success) {
        console.error(parsed.error);
        throw new SchemaError("Invalid response schema");
      }
      return parsed.data;
    }

    return json as T;
  });
}

// ------------------------------------------------------
// PUBLIC HTTP API
// ------------------------------------------------------
export const http = {
  get: <T>(url: string, schema?: z.ZodSchema<T>) =>
    request<T>(url, {}, schema),

  post: <T>(url: string, body: any, schema?: z.ZodSchema<T>) =>
    request<T>(
      url,
      { method: "POST", body: JSON.stringify(body) },
      schema
    ),

  put: <T>(url: string, body: any, schema?: z.ZodSchema<T>) =>
    request<T>(
      url,
      { method: "PUT", body: JSON.stringify(body) },
      schema
    ),

  del: <T>(url: string, schema?: z.ZodSchema<T>) =>
    request<T>(url, { method: "DELETE" }, schema),
};
