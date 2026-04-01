// app/api/products/route.ts
import { NextRequest } from "next/server";
import { ok, badRequest, serverError, tooManyRequests } from "@/lib/api/response";
import { getProducts } from "@/lib/catalog/service";
import { checkRateLimit } from "@/lib/api/rate-limit";
import type { ProductListParams } from "@/lib/catalog/types";

export async function GET(req: NextRequest) {
  try {
    const ip = req.ip ?? "unknown";
    const { allowed, retryAfter } = checkRateLimit(ip);

    if (!allowed) {
      return tooManyRequests(`Rate limit exceeded. Retry after ${retryAfter}s`);
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search") || undefined;
    const minPrice = url.searchParams.get("minPrice")
      ? parseInt(url.searchParams.get("minPrice")!, 10)
      : undefined;
    const maxPrice = url.searchParams.get("maxPrice")
      ? parseInt(url.searchParams.get("maxPrice")!, 10)
      : undefined;
    const limit = url.searchParams.get("limit")
      ? parseInt(url.searchParams.get("limit")!, 10)
      : undefined;
    const cursor = url.searchParams.get("cursor") || undefined;
    const includeArchived = url.searchParams.get("includeArchived") === "true";

    if ((minPrice && isNaN(minPrice)) || (maxPrice && isNaN(maxPrice))) {
      return badRequest("minPrice and maxPrice must be valid numbers");
    }
    if (limit && (isNaN(limit) || limit <= 0)) {
      return badRequest("limit must be a positive number");
    }

    const params: ProductListParams = {
      search,
      minPrice,
      maxPrice,
      limit,
      cursor,
      includeArchived,
    };

    const products = await getProducts(params);
    return ok(products);
  } catch (err) {
    return serverError("Failed to fetch products", err);
  }
}