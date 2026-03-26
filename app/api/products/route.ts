// File: app/api/products/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { productCardSelect } from "@/lib/types/product";
import { mapProductToCard } from "@/lib/mappers/product";
import { formatKobo } from "@/lib/formatters";

export const revalidate = 60;

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: productCardSelect,
    });

    const mapped = products.map((product) => {
      const card = mapProductToCard(product);

      // Add formatted prices
      return {
        ...card,
        formattedPrice: formatKobo(card.price, false),
        formattedSalePrice: card.salePrice ? formatKobo(card.salePrice, false) : null,
      };
    });

    return NextResponse.json(
      { success: true, data: mapped, count: mapped.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}