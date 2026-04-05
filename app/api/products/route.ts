// app/api/products/route.ts
import { NextRequest } from "next/server";
import { ok, badRequest, tooManyRequests, serverError } from "@/lib/api/response";
import { getProducts } from "@/lib/catalog/service";
import { checkRateLimit } from "@/lib/api/rate-limit";

export async function GET(req: NextRequest) {
  try {
    // --- Rate Limit ---
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0].trim() || req.ip || "unknown";

    const { allowed, retryAfter } = checkRateLimit(ip);
    if (!allowed) return tooManyRequests(`Rate limit exceeded. Retry after ${retryAfter}s`);

    // --- Parse query params ---
    const url = req.nextUrl;
    const search = url.searchParams.get("search") || undefined;
    const minPriceRaw = url.searchParams.get("minPrice");
    const maxPriceRaw = url.searchParams.get("maxPrice");
    const limitRaw = url.searchParams.get("limit");
    const cursor = url.searchParams.get("cursor") || undefined;
    const includeArchived = url.searchParams.get("includeArchived") === "true";

    const minPrice = minPriceRaw ? Number(minPriceRaw) : undefined;
    const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined;
    const limit = limitRaw ? Number(limitRaw) : undefined;

    // --- Validate ---
    if (search && search.length > 100) return badRequest("Search query too long");
    if (minPrice !== undefined && (isNaN(minPrice) || minPrice < 0)) return badRequest("minPrice must be non-negative");
    if (maxPrice !== undefined && (isNaN(maxPrice) || maxPrice < 0)) return badRequest("maxPrice must be non-negative");
    if (limit !== undefined && (isNaN(limit) || limit <= 0)) return badRequest("limit must be positive");

    const safeLimit = Math.min(limit ?? 20, 100);

    // --- Fetch products ---
    const products = await getProducts({ search, minPrice, maxPrice, limit: safeLimit, cursor, includeArchived });

    return ok(products);
  } catch (err) {
    return serverError("Failed to fetch products", err);
  }
}