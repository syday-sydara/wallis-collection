// lib/api/response.ts
import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, { status: 200, ...init });
}

export function badRequest(message: string, issues?: unknown) {
  return NextResponse.json(
    { success: false, error: message, issues },
    { status: 400 }
  );
}

export function serverError(message = "Something went wrong", err?: unknown) {
  if (err) {
    Sentry.captureException(err);
  }

  return NextResponse.json(
    { success: false, error: message },
    { status: 500 }
  );
}
