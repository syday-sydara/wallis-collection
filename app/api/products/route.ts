// app/api/products/route.ts
import { NextRequest } from "next/server";
import {
  ok,
  badRequest,
  serverError,
  tooManyRequests
} from "@/lib/api/response";
import { getProducts } from "@/lib/catalog/service";
import { checkRateLimit } from "@/lib/api/rate-limit";
import type { ProductListParams } from "@/lib/catalog/types";

export async function GET(req: NextRequest) {
  try {
    // --- IP + Rate Limit ---
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0].trim() || req.ip || "unknown";

    const { allowed, retryAfter } = checkRateLimit(ip);
    if (!allowed) {
      return tooManyRequests(`Rate limit exceeded. Retry after ${retryAfter}s`);
    }

    // --- Parse Query Params ---
    const url = req.nextUrl;

    const search = url.searchParams.get("search") || undefined;

    const minPriceRaw = url.searchParams.get("minPrice");
    const maxPriceRaw = url.searchParams.get("maxPrice");
    const limitRaw = url.searchParams.get("limit");

    const minPrice = minPriceRaw ? Number(minPriceRaw) : undefined;
    const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined;
    const limit = limitRaw ? Number(limitRaw) : undefined;

    const cursor = url.searchParams.get("cursor") || undefined;
    const includeArchived = url.searchParams.get("includeArchived") === "true";

    // --- Validate ---
    if (search && search.length > 100) {
      return badRequest("Search query too long");
    }

    if (minPrice !== undefined && (Number.isNaN(minPrice) || minPrice < 0)) {
      return badRequest("minPrice must be a non-negative number");
    }

    if (maxPrice !== undefined && (Number.isNaN(maxPrice) || maxPrice < 0)) {
      return badRequest("maxPrice must be a non-negative number");
    }

    if (limit !== undefined && (Number.isNaN(limit) || limit <= 0)) {
      return badRequest("limit must be a positive number");
    }

    if (cursor && cursor.length > 200) {
      return badRequest("Invalid cursor");
    }

    // Cap limit
    const safeLimit = Math.min(limit ?? 20, 100);

    // --- Build Params ---
    const params: ProductListParams = {
      search,
      minPrice,
      maxPrice,
      limit: safeLimit,
      cursor,
      includeArchived, // consider restricting this
    };

    // --- Fetch ---
    const products = await getProducts(params);

    return ok(products);
  } catch (err) {
    return serverError("Failed to fetch products", err);
  }
}