// lib/api/response.ts
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

type ResponseData<T> = {
  success: true;
  data: T;
};

type ResponseError = {
  success: false;
  error: string;
  issues?: unknown;
};

/**
 * 200 OK — Successful response
 */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ResponseData<T>>(
    { success: true, data },
    { status: 200, ...init }
  );
}

/**
 * 400 Bad Request — Validation or client error
 */
export function badRequest(message: string, issues?: unknown) {
  return NextResponse.json<ResponseError>(
    { success: false, error: message, issues },
    { status: 400 }
  );
}

/**
 * 404 Not Found — Resource missing
 */
export function notFound(message = "Resource not found") {
  return NextResponse.json<ResponseError>(
    { success: false, error: message },
    { status: 404 }
  );
}

/**
 * 429 Too Many Requests — Rate limit exceeded
 */
export function tooManyRequests(message = "Too many requests") {
  return NextResponse.json<ResponseError>(
    { success: false, error: message },
    { status: 429 }
  );
}

/**
 * 500 Internal Server Error — Logs to Sentry
 */
export function serverError(
  message = "Something went wrong",
  err?: unknown
) {
  if (err) {
    Sentry.captureException(err);
    console.error("Server error:", err);
  }

  return NextResponse.json<ResponseError>(
    { success: false, error: message },
    { status: 500 }
  );
}
