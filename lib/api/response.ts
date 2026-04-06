// lib/api/response.ts
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

type ResponseData<T> = {
  success: true;
  data: T;
  meta?: unknown;
};

type ResponseError = {
  success: false;
  error: string;
  code?: string;
  issues?: unknown;
};

function json<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, init);
}

/* Success */
export function ok<T>(data: T, meta?: unknown, init?: ResponseInit) {
  return json<ResponseData<T>>({ success: true, data, meta }, { status: 200, ...init });
}

export function created<T>(data: T, init?: ResponseInit) {
  return json<ResponseData<T>>({ success: true, data }, { status: 201, ...init });
}

export function noContent(init?: ResponseInit) {
  return new NextResponse(null, { status: 204, ...init });
}

/* Client errors */
export function badRequest(message: string, issues?: unknown, code?: string, init?: ResponseInit) {
  return json<ResponseError>({ success: false, error: message, issues, code }, { status: 400, ...init });
}

export function unprocessable(message = "Validation failed", issues?: unknown, code?: string, init?: ResponseInit) {
  return json<ResponseError>({ success: false, error: message, issues, code }, { status: 422, ...init });
}

export function unauthorized(message = "Unauthorized", code?: string, init?: ResponseInit) {
  return json<ResponseError>({ success: false, error: message, code }, { status: 401, ...init });
}

export function forbidden(message = "Forbidden", code?: string, init?: ResponseInit) {
  return json<ResponseError>({ success: false, error: message, code }, { status: 403, ...init });
}

export function notFound(message = "Resource not found", code?: string, init?: ResponseInit) {
  return json<ResponseError>({ success: false, error: message, code }, { status: 404, ...init });
}

export function conflict(message = "Conflict", code?: string, init?: ResponseInit) {
  return json<ResponseError>({ success: false, error: message, code }, { status: 409, ...init });
}

export function tooManyRequests(message = "Too many requests", code?: string, retryAfter?: number, init?: ResponseInit) {
  return json<ResponseError>(
    { success: false, error: message, code },
    {
      status: 429,
      ...init,
      headers: {
        ...(init?.headers ?? {}),
        ...(retryAfter ? { "Retry-After": retryAfter.toString() } : {}),
      },
    }
  );
}

export function serviceUnavailable(message = "Service unavailable", code?: string, init?: ResponseInit) {
  return json<ResponseError>({ success: false, error: message, code }, { status: 503, ...init });
}

/* Server error */
export function serverError(message = "Something went wrong", err?: unknown, code?: string, init?: ResponseInit) {
  if (err) {
    Sentry.captureException(err, {
      tags: { api: true },
      extra: { message },
    });
    console.error("Server error:", err);
  }

  return json<ResponseError>({ success: false, error: message, code }, { status: 500, ...init });
}

/* Redirect */
export function redirectResponse(url: string, status: 302) {
  return NextResponse.redirect(url, status);
}