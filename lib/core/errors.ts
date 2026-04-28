// lib/core/errors.ts

import { serviceContext } from "./service-context";

export interface ErrorOptions {
  status?: number;
  meta?: Record<string, any>;
  cause?: unknown;
  operational?: boolean;
}

function normalizeMeta(meta: any) {
  try {
    JSON.stringify(meta);
    return meta;
  } catch {
    return { error: "Failed to serialize meta" };
  }
}

function normalizeCause(cause: unknown) {
  if (cause instanceof Error) {
    return {
      message: cause.message,
      stack: cause.stack,
      name: cause.name,
    };
  }
  return cause;
}

export class AppError extends Error {
  code: string;
  status: number;
  meta: Record<string, any>;
  cause?: unknown;
  operational: boolean;

  constructor(code: string, message: string, options: ErrorOptions = {}) {
    super(message);

    this.code = code;
    this.status = options.status ?? 400;
    this.meta = normalizeMeta(options.meta ?? {});
    this.cause = normalizeCause(options.cause);
    this.operational = options.operational ?? true;

    // Attach context
    const ctx = serviceContext.get();
    this.meta = {
      ...this.meta,
      requestId: ctx.requestId,
      userId: ctx.userId,
      sessionId: ctx.sessionId,
      traceId: ctx.traceId,
    };

    // Preserve stack
    if (options.cause instanceof Error && options.cause.stack) {
      this.stack += `\nCaused by: ${options.cause.stack}`;
    }

    // Make all fields enumerable (important for JSON logs)
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Safe JSON representation for API responses.
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      meta: normalizeMeta(this.meta),
    };
  }

  /**
   * Structured log payload (includes stack in dev).
   */
  toLog() {
    const base = {
      code: this.code,
      message: this.message,
      status: this.status,
      meta: this.meta,
      operational: this.operational,
    };

    if (process.env.NODE_ENV !== "production") {
      return { ...base, stack: this.stack, cause: this.cause };
    }

    return base;
  }
}

/* -------------------------------------------------- */
/* Type Guard                                          */
/* -------------------------------------------------- */

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

/* -------------------------------------------------- */
/* Common Error Types                                  */
/* -------------------------------------------------- */

export class ValidationError extends AppError {
  constructor(message: string, meta?: any) {
    super("VALIDATION_ERROR", message, {
      status: 422,
      meta,
      operational: true,
    });
  }
}

export class AuthError extends AppError {
  constructor(message = "Unauthorized") {
    super("AUTH_ERROR", message, {
      status: 401,
      operational: true,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, meta?: any) {
    super("NOT_FOUND", `${resource} not found`, {
      status: 404,
      meta,
      operational: true,
    });
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", meta?: any) {
    super("BAD_REQUEST", message, {
      status: 400,
      meta,
      operational: true,
    });
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests", meta?: any) {
    super("RATE_LIMITED", message, {
      status: 429,
      meta,
      operational: true,
    });
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, meta?: any, cause?: unknown) {
    super("EXTERNAL_SERVICE_ERROR", message, {
      status: 502,
      meta: { service, ...meta },
      cause,
      operational: true,
    });
  }
}

/* -------------------------------------------------- */
/* Helper: Wrap unknown errors into AppError           */
/* -------------------------------------------------- */

export function wrapError(err: unknown, message = "Unexpected error") {
  if (err instanceof AppError) return err;

  return new AppError("UNEXPECTED_ERROR", message, {
    status: 500,
    cause: err,
    operational: false,
  });
}
