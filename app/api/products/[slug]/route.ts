import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  if (!params?.slug) return NextResponse.json({ success: false, error: "Invalid slug" }, { status: 400 });

  try {
    const product = await prisma.product.findFirst({
      where: { slug: params.slug, deletedAt: null },
      include: {
        images: { orderBy: { position: "asc" } },
        reviews: { include: { user: { select: { id: true; name: true } } }, orderBy: { createdAt: "desc" } },
      },
    });

    if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch product" }, { status: 500 });
  }
}