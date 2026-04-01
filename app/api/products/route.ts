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
    // ---------------- IP + Rate Limit ----------------
    const ip =
      req.ip ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    const { allowed, retryAfter } = checkRateLimit(ip);
    if (!allowed) {
      return tooManyRequests(`Rate limit exceeded. Retry after ${retryAfter}s`);
    }

    // ---------------- Parse Query Params ----------------
    const url = new URL(req.url);

    const search = url.searchParams.get("search") || undefined;

    const minPriceRaw = url.searchParams.get("minPrice");
    const maxPriceRaw = url.searchParams.get("maxPrice");
    const limitRaw = url.searchParams.get("limit");

    const minPrice =
      minPriceRaw !== null ? Number(minPriceRaw) : undefined;
    const maxPrice =
      maxPriceRaw !== null ? Number(maxPriceRaw) : undefined;
    const limit =
      limitRaw !== null ? Number(limitRaw) : undefined;

    const cursor = url.searchParams.get("cursor") || undefined;
    const includeArchived =
      url.searchParams.get("includeArchived") === "true";

    // ---------------- Validate Numbers ----------------
    if (minPrice !== undefined && Number.isNaN(minPrice)) {
      return badRequest("minPrice must be a valid number");
    }
    if (maxPrice !== undefined && Number.isNaN(maxPrice)) {
      return badRequest("maxPrice must be a valid number");
    }
    if (limit !== undefined && (Number.isNaN(limit) || limit <= 0)) {
      return badRequest("limit must be a positive number");
    }

    // Cap limit to prevent abuse
    const safeLimit = Math.min(limit ?? 20, 100);

    // ---------------- Build Params ----------------
    const params: ProductListParams = {
      search,
      minPrice,
      maxPrice,
      limit: safeLimit,
      cursor,
      includeArchived
    };

    // ---------------- Fetch Products ----------------
    const products = await getProducts(params);
    return ok(products);
  } catch (err) {
    return serverError("Failed to fetch products", err);
  }
}
