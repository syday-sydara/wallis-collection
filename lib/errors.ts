import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  issues?: unknown;
  meta?: unknown;
};

export class ApiError extends Error {
  status: number;
  meta?: unknown;

  constructor(message: string, status = 400, meta?: unknown) {
    super(message);
    this.status = status;
    this.meta = meta;
  }

  static badRequest(message = "Bad request", meta?: unknown) { return new ApiError(message, 400, meta); }
  static unauthorized(message = "Unauthorized", meta?: unknown) { return new ApiError(message, 401, meta); }
  static forbidden(message = "Forbidden", meta?: unknown) { return new ApiError(message, 403, meta); }
  static notFound(message = "Not found", meta?: unknown) { return new ApiError(message, 404, meta); }
  static conflict(message = "Conflict", meta?: unknown) { return new ApiError(message, 409, meta); }
  static serverError(message = "Internal server error", meta?: unknown) { return new ApiError(message, 500, meta); }
}

export function logError(error: unknown) { console.error("[API ERROR]", error); }

export function handleSuccess<T>(data: T, status = 200, meta?: unknown): Response {
  return new Response(JSON.stringify({ success: true, data, meta }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function handleError(error: unknown): Response {
  if (error instanceof ApiError) {
    logError(error);
    return new Response(JSON.stringify({ success: false, error: error.message, meta: error.meta }), { status: error.status, headers: { "Content-Type": "application/json" } });
  }
  if (error instanceof PrismaClientKnownRequestError) {
    logError(error);
    if (error.code === "P2002") return new Response(JSON.stringify({ success: false, error: "Unique constraint violation", meta: error.meta }), { status: 409, headers: { "Content-Type": "application/json" } });
    if (error.code === "P2025") return new Response(JSON.stringify({ success: false, error: "Record not found", meta: error.meta }), { status: 404, headers: { "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ success: false, error: "Database error", meta: error.meta }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
  if (error instanceof ZodError) return new Response(JSON.stringify({ success: false, error: "Invalid input", issues: error.issues }), { status: 422, headers: { "Content-Type": "application/json" } });
  logError(error);
  return new Response(JSON.stringify({ success: false, error: "Internal server error", meta: error instanceof Error ? error.message : error }), { status: 500, headers: { "Content-Type": "application/json" } });
}

const formatterWithDecimals = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatterNoDecimals = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Format price in Naira to NGN currency string
 */
export function formatPrice(
  priceNaira: number | null | undefined,
  withDecimals: boolean = true
): string {
  if (typeof priceNaira !== "number" || isNaN(priceNaira)) {
    return withDecimals ? "₦0.00" : "₦0";
  }

  return withDecimals
    ? formatterWithDecimals.format(priceNaira)
    : formatterNoDecimals.format(priceNaira);
}

/**
 * Optional: general currency formatter
 */
export function formatCurrency(
  amount: number,
  currency: string = "NGN",
  withDecimals: boolean = true
) {
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  });

  return formatter.format(amount);
}