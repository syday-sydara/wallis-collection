// app/api/products/route.ts

import { NextRequest } from "next/server";
import { ok, badRequest, tooManyRequests, serverError } from "@/lib/api/response";
import { getProducts } from "@/lib/products/service";
import { checkRateLimit } from "@/lib/api/rate-limit";

const MAX_LIMIT = 50;

const parseNumber = (value: string | null) => {
  if (value === null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
};

export async function GET(req: NextRequest) {
  try {
    // --- Rate Limit ---
    const ip = req.ip || req.headers.get("x-real-ip") || "unknown";
    const { allowed, retryAfter } = checkRateLimit(ip);

    if (!allowed) {
      return tooManyRequests(`Rate limit exceeded. Retry after ${retryAfter}s`);
    }

    // --- Query params ---
    const url = req.nextUrl;

    const search = url.searchParams.get("search") || undefined;
    const minPrice = parseNumber(url.searchParams.get("minPrice"));
    const maxPrice = parseNumber(url.searchParams.get("maxPrice"));
    const limit = parseNumber(url.searchParams.get("limit"));
    const cursor = url.searchParams.get("cursor") || undefined;
    const sort = url.searchParams.get("sort") || "latest";

    // --- Validation ---
    if (search && search.length > 100) {
      return badRequest("Search query too long");
    }

    if (minPrice !== undefined && (isNaN(minPrice) || minPrice < 0)) {
      return badRequest("minPrice must be non-negative");
    }

    if (maxPrice !== undefined && (isNaN(maxPrice) || maxPrice < 0)) {
      return badRequest("maxPrice must be non-negative");
    }

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      return badRequest("minPrice cannot be greater than maxPrice");
    }

    if (limit !== undefined && (isNaN(limit) || limit <= 0)) {
      return badRequest("limit must be positive");
    }

    const safeLimit = Math.min(limit ?? 20, MAX_LIMIT);

    // --- Fetch ---
    const products = await getProducts({
      search,
      minPrice,
      maxPrice,
      limit: safeLimit,
      cursor,
      sort,
    });

    return ok(products);
  } catch (err) {
    return serverError("Failed to fetch products", err);
  }
}