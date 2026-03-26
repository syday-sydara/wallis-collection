import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { productCardSelect } from "@/lib/types/product";
import { mapProductToCard } from "@/lib/mappers/product";

export const revalidate = 60; // ISR: cache 60s

// Default pagination settings
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

export async function GET(req: NextRequest) {
  try {
    // Extract page and limit from query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "") || DEFAULT_PAGE;
    const limit = parseInt(searchParams.get("limit") || "") || DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    // Fetch products with pagination
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: productCardSelect,
    });

    // Map products for frontend
    const mappedProducts = products.map(mapProductToCard);

    // Total product count (optional, useful for infinite scroll)
    const total = await prisma.product.count({ where: { deletedAt: null } });

    return NextResponse.json(
      {
        success: true,
        data: mappedProducts,
        page,
        limit,
        total,
        hasMore: skip + mappedProducts.length < total,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("Paginated API Error:", err);

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}