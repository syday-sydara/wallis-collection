// File: app/api/product/[slug]/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { mapProductDetail } from "@/lib/mappers/product";
import { formatPrice } from "@/lib/formatters";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  if (!params?.slug) {
    return NextResponse.json(
      { success: false, error: "Invalid slug" },
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.findUnique({
      where: {
        slug_deletedAt: {
          slug: params.slug,
          deletedAt: null,
        },
      },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Map to UI-ready detail object
    const mapped = mapProductDetail(product);

    return NextResponse.json({
      success: true,
      data: {
        ...mapped,
        formattedPrice: formatPrice(mapped.salePrice ?? mapped.price),
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
