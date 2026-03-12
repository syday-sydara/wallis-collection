import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { productCardSelect } from "@/lib/types/product";

export const revalidate = 60;

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        ...productCardSelect,
        images: {
          select: { url: true, position: true },
          orderBy: { position: "asc" },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: products,
        count: products.length,
      },
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