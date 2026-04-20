// app/api/products/route.ts
import { NextRequest } from "next/server";
import { getProducts } from "@/lib/products/service";
import type { ProductListParams } from "@/lib/products/types";

const ALLOWED_SORT = new Set(["newest", "price-asc", "price-desc"]);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const toNumber = (value: string | null) => {
      if (!value) return undefined;
      const n = Number(value);
      return Number.isFinite(n) ? n : undefined;
    };

    const rawSearch = searchParams.get("search")?.trim() || undefined;
    const rawSort = searchParams.get("sort") || "newest";

    const params: ProductListParams = {
      search: rawSearch || undefined,
      sort: ALLOWED_SORT.has(rawSort) ? rawSort : "newest",
      cursor: searchParams.get("cursor") || undefined,
      includeArchived: searchParams.get("includeArchived") === "true",
      minPrice: toNumber(searchParams.get("minPrice")),
      maxPrice: toNumber(searchParams.get("maxPrice")),
      limit: Math.min(toNumber(searchParams.get("limit")) ?? 20, 50),
    };

    const result = await getProducts(params);

    return Response.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    console.error("API /products failed:", err);

    return new Response(
      JSON.stringify({ error: "Failed to load products" }),
      { status: 500 }
    );
  }
}
