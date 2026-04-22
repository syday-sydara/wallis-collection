import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { imageId } = await req.json();
    const productId = params.productId;

    // -----------------------------
    // Validate input
    // -----------------------------
    if (!imageId) {
      return NextResponse.json(
        { error: "imageId is required" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Ensure product exists
    // -----------------------------
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // -----------------------------
    // Ensure image exists and belongs to product
    // -----------------------------
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
      select: { id: true, productId: true },
    });

    if (!image) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    if (image.productId !== productId) {
      return NextResponse.json(
        { error: "Image does not belong to this product" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Reset all images to non-primary
    // -----------------------------
    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });

    // -----------------------------
    // Set selected image as primary
    // -----------------------------
    await prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });

    // -----------------------------
    // Audit log (Shopify-style)
    // -----------------------------
    await prisma.auditLog.create({
      data: {
        action: "PRODUCT_PRIMARY_IMAGE_SET",
        actorType: "ADMIN",
        resource: "product",
        resourceId: productId,
        message: "Primary product image updated",
        metadata: { imageId },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Set primary image error:", err);
    return NextResponse.json(
      { error: "Failed to set primary image" },
      { status: 500 }
    );
  }
}
