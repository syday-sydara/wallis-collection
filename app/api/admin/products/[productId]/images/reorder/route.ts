import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { imageIds } = await req.json();

    // -----------------------------
    // Validate input
    // -----------------------------
    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: "imageIds must be a non-empty array" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Ensure product exists
    // -----------------------------
    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // -----------------------------
    // Ensure all images belong to this product
    // -----------------------------
    const images = await prisma.productImage.findMany({
      where: { id: { in: imageIds } },
      select: { id: true, productId: true },
    });

    if (images.length !== imageIds.length) {
      return NextResponse.json(
        { error: "Some images do not exist" },
        { status: 400 }
      );
    }

    const invalid = images.find((img) => img.productId !== params.productId);
    if (invalid) {
      return NextResponse.json(
        { error: "One or more images do not belong to this product" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Update sort order
    // -----------------------------
    await Promise.all(
      imageIds.map((id: string, index: number) =>
        prisma.productImage.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    // -----------------------------
    // Audit log (Shopify-style)
    // -----------------------------
    await prisma.auditLog.create({
      data: {
        action: "PRODUCT_IMAGES_REORDERED",
        actorType: "ADMIN",
        resource: "product",
        resourceId: params.productId,
        message: "Product images reordered",
        metadata: { imageIds },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Image reorder error:", err);
    return NextResponse.json(
      { error: "Failed to reorder images" },
      { status: 500 }
    );
  }
}
