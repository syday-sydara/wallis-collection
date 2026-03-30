// lib/api/response.ts
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

type ResponseData<T> = { success: true; data: T };
type ResponseError = { success: false; error: string; issues?: unknown };

/**
 * Return a 200 OK response
 */
export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ResponseData<T>>(
    { success: true, data },
    { status: 200, ...init }
  );
}

/**
 * Return a 400 Bad Request response
 */
export function badRequest(message: string, issues?: unknown) {
  return NextResponse.json<ResponseError>(
    { success: false, error: message, issues },
    { status: 400 }
  );
}

/**
 * Return a 500 Internal Server Error response
 * Also logs the error to Sentry if provided
 */
export function serverError(message = "Something went wrong", err?: unknown) {
  if (err) {
    Sentry.captureException(err);
    console.error("Server error:", err); // local logging for devs
  }

  return NextResponse.json<ResponseError>(
    { success: false, error: message },
    { status: 500 }
  );
}