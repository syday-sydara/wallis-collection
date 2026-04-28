// lib/core/errors.ts

import { serviceContext } from "./service-context";

export interface ErrorOptions {
  status?: number;
  meta?: Record<string, any>;
  cause?: unknown;
  operational?: boolean;
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
    this.meta = options.meta ?? {};
    this.cause = options.cause;
    this.operational = options.operational ?? true;

    // Enrich with service context
    const ctx = serviceContext.get();
    this.meta = {
      ...this.meta,
      requestId: ctx.requestId,
      userId: ctx.userId,
      sessionId: ctx.sessionId,
      traceId: ctx.traceId,
    };

    // Preserve original stack if cause is an Error
    if (options.cause instanceof Error && options.cause.stack) {
      this.stack += `\nCaused by: ${options.cause.stack}`;
    }
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      meta: safeMeta(this.meta),
    };
  }
}

function safeMeta(meta: any) {
  try {
    JSON.stringify(meta);
    return meta;
  } catch {
    return { error: "Failed to serialize meta" };
  }
}

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
