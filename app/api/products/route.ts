// app/api/products/route.ts
import { NextRequest } from "next/server";
import { getProducts } from "@/lib/products/service";
import type { ProductListParams } from "@/lib/products/types";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    // Helper to safely parse numbers
    const toNumber = (value: string | null) => {
      if (!value) return undefined;
      const n = Number(value);
      return Number.isFinite(n) ? n : undefined;
    };

    const params: ProductListParams = {
      search: searchParams.get("search") || undefined,
      sort: searchParams.get("sort") || "newest",
      category: searchParams.get("category") || undefined,
      cursor: searchParams.get("cursor") || undefined,
      includeArchived: searchParams.get("includeArchived") === "true",
      minPrice: toNumber(searchParams.get("minPrice")),
      maxPrice: toNumber(searchParams.get("maxPrice")),
      limit: toNumber(searchParams.get("limit")) ?? 20, // safe default
    };

    // Optional: early return if params are empty
    // (useful for caching and performance)
    if (!params.search && !params.category && !params.cursor) {
      // You can choose to return featured products here
      // or simply continue normally.
    }

    const result = await getProducts(params);

    return Response.json(result, {
      headers: {
        // Better caching for Vercel / Edge
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
