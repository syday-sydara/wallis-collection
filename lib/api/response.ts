// File: lib/api/response.ts

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";

/* ------------------------------------------------------------
   API Response Types
------------------------------------------------------------- */
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  issues?: unknown;
  meta?: unknown;
};

/* ------------------------------------------------------------
   API Error Class
------------------------------------------------------------- */
export class ApiError extends Error {
  status: number;
  meta?: unknown;

  constructor(message: string, status = 400, meta?: unknown) {
    super(message);
    this.status = status;
    this.meta = meta;
  }

  static badRequest(message = "Bad request", meta?: unknown) {
    return new ApiError(message, 400, meta);
  }
  static unauthorized(message = "Unauthorized", meta?: unknown) {
    return new ApiError(message, 401, meta);
  }
  static forbidden(message = "Forbidden", meta?: unknown) {
    return new ApiError(message, 403, meta);
  }
  static notFound(message = "Not found", meta?: unknown) {
    return new ApiError(message, 404, meta);
  }
  static conflict(message = "Conflict", meta?: unknown) {
    return new ApiError(message, 409, meta);
  }
  static serverError(message = "Internal server error", meta?: unknown) {
    return new ApiError(message, 500, meta);
  }
}

/* ------------------------------------------------------------
   Logging
------------------------------------------------------------- */
export function logError(error: unknown) {
  console.error("[API ERROR]", error);
}

/* ------------------------------------------------------------
   Success Response
------------------------------------------------------------- */
export function handleSuccess<T>(
  data: T,
  status = 200,
  meta?: unknown
): Response {
  return new Response(
    JSON.stringify({ success: true, data, meta }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/* ------------------------------------------------------------
   Error Response
------------------------------------------------------------- */
export function handleError(error: unknown): Response {
  // Custom API errors
  if (error instanceof ApiError) {
    logError(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        meta: error.meta,
      }),
      {
        status: error.status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    logError(error);

    if (error.code === "P2002") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unique constraint violation",
          meta: error.meta,
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    if (error.code === "P2025") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Record not found",
          meta: error.meta,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Database error",
        meta: error.meta,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid input",
        issues: error.issues,
      }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  }

  // Unknown errors
  logError(error);

  return new Response(
    JSON.stringify({
      success: false,
      error: "Internal server error",
      meta: error instanceof Error ? error.message : error,
    }),
    { status: 500, headers: { "Content-Type": "application/json" } }
  );
}
