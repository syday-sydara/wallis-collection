import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    // Validate slug
    if (!params?.slug || typeof params.slug !== "string") {
      return NextResponse.json(
        { error: "Invalid product slug" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug: params.slug, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        priceNaira: true,
        salePriceNaira: true,
        stock: true,
        isNew: true,
        isOnSale: true,
        featured: true,
        images: {
          select: { id: true, url: true, position: true },
          orderBy: { position: "asc" },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("API Error (product detail):", {
      slug: params.slug,
      message: error.message,
    });

    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
