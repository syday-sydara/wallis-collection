// lib/api/response.ts
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

type ErrorDetails = {
  code?: string;
  issues?: unknown;
  [key: string]: unknown;
};

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

/* Base JSON helper */
function json<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, init);
}

/* ---------------------------------------------
 * SUCCESS RESPONSES
 * --------------------------------------------- */

export function ok<T>(data: T, meta?: unknown, init?: ResponseInit) {
  const body: ResponseData<T> = meta
    ? { success: true, data, meta }
    : { success: true, data };

  return json(body, { status: 200, ...init });
}

export function created<T>(data: T, init?: ResponseInit) {
  return json<ResponseData<T>>({ success: true, data }, { status: 201, ...init });
}

export function noContent(init?: ResponseInit) {
  const res = new NextResponse(null, { status: 204, ...init });
  res.headers.delete("Content-Type");
  res.headers.delete("Content-Length");
  return res;
}

/* ---------------------------------------------
 * CLIENT ERRORS
 * --------------------------------------------- */

export function badRequest(
  message: string,
  details?: ErrorDetails,
  init?: ResponseInit
) {
  return json<ResponseError>(
    { success: false, error: message, ...details },
    { status: 400, ...init }
  );
}

export function unprocessable(
  message = "Validation failed",
  details?: ErrorDetails,
  init?: ResponseInit
) {
  return json<ResponseError>(
    { success: false, error: message, ...details },
    { status: 422, ...init }
  );
}

export function unauthorized(
  message = "Unauthorized",
  details?: ErrorDetails,
  init?: ResponseInit
) {
  return json<ResponseError>(
    { success: false, error: message, ...details },
    { status: 401, ...init }
  );
}

export function forbidden(
  message = "Forbidden",
  details?: ErrorDetails,
  init?: ResponseInit
) {
  return json<ResponseError>(
    { success: false, error: message, ...details },
    { status: 403, ...init }
  );
}

export function notFound(
  message = "Resource not found",
  details?: ErrorDetails,
  init?: ResponseInit
) {
  return json<ResponseError>(
    { success: false, error: message, ...details },
    { status: 404, ...init }
  );
}

export function conflict(
  message = "Conflict",
  details?: ErrorDetails,
  init?: ResponseInit
) {
  return json<ResponseError>(
    { success: false, error: message, ...details },
    { status: 409, ...init }
  );
}

export function tooManyRequests(
  message = "Too many requests",
  details?: ErrorDetails,
  retryAfter?: number,
  init?: ResponseInit
) {
  return json<ResponseError>(
    { success: false, error: message, ...details },
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

export function serviceUnavailable(
  message = "Service unavailable",
  details?: ErrorDetails,
  init?: ResponseInit
) {
  return json<ResponseError>(
    { success: false, error: message, ...details },
    { status: 503, ...init }
  );
}

/* ---------------------------------------------
 * SERVER ERROR
 * --------------------------------------------- */

export function serverError(
  message = "Something went wrong",
  err?: unknown,
  details?: ErrorDetails,
  init?: ResponseInit
) {
  if (err) {
    Sentry.captureException(err, {
      tags: { api: true },
      extra: { message },
    });
    console.error("Server error:", err);
  }

  return json<ResponseError>(
    { success: false, error: message, ...details },
    { status: 500, ...init }
  );
}

/* ---------------------------------------------
 * REDIRECTS
 * --------------------------------------------- */

export function redirectResponse(url: string, status: 302) {
  return NextResponse.redirect(url, status);
}

export function seeOther(url: string) {
  return NextResponse.redirect(url, 303);
}
