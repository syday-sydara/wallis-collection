/**
 * Custom API error with HTTP status code
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }

  /** 400 Bad Request */
  static badRequest(message = "Bad request") {
    return new ApiError(message, 400);
  }

  /** 401 Unauthorized */
  static unauthorized(message = "Unauthorized") {
    return new ApiError(message, 401);
  }

  /** 403 Forbidden */
  static forbidden(message = "Forbidden") {
    return new ApiError(message, 403);
  }

  /** 404 Not Found */
  static notFound(message = "Not found") {
    return new ApiError(message, 404);
  }

  /** 409 Conflict */
  static conflict(message = "Conflict") {
    return new ApiError(message, 409);
  }

  /** 500 Internal Server Error */
  static serverError(message = "Internal server error") {
    return new ApiError(message, 500);
  }
}

/**
 * Centralized error logger
 * (Extendable for Sentry, Logtail, Datadog, etc.)
 */
export function logError(error: unknown) {
  console.error("API Error:", error);
}

/**
 * Unified success response helper
 */
export function handleSuccess<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}

/**
 * Unified error handler for API routes
 */
export function handleError(error: unknown) {
  // 1. Custom API errors
  if (error instanceof ApiError) {
    logError(error);
    return Response.json(
      { error: error.message },
      { status: error.status }
    );
  }

  // 2. Prisma errors (narrow check)
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as any).code === "string"
  ) {
    logError(error);
    return Response.json(
      { error: "Database error" },
      { status: 500 }
    );
  }

  // 3. Zod errors (narrow check)
  if (
    typeof error === "object" &&
    error !== null &&
    "issues" in error &&
    Array.isArray((error as any).issues)
  ) {
    return Response.json(
      {
        error: "Invalid input",
        issues: (error as any).issues,
      },
      { status: 422 }
    );
  }

  // 4. Unexpected errors
  logError(error);

  return Response.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}