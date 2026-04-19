// app/api/products/route.ts
import { NextRequest } from "next/server";
import { getProducts } from "@/lib/products/service";
import type { ProductListParams } from "@/lib/products/types";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const params: ProductListParams = {
      search: searchParams.get("search") || undefined,
      sort: searchParams.get("sort") || undefined,
      cursor: searchParams.get("cursor") || undefined,
      includeArchived: searchParams.get("includeArchived") === "true",
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      limit: searchParams.get("limit")
        ? Number(searchParams.get("limit"))
        : undefined,
    };

    const result = await getProducts(params);

    return Response.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
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
