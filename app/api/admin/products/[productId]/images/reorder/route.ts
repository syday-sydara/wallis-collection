import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    const { imageIds } = await req.json();

    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json(
        { error: "imageIds must be a non-empty array" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: params.productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const images = await prisma.productImage.findMany({
      where: { id: { in: imageIds } },
      select: { id: true, productId: true },
    });

    if (images.length !== imageIds.length) {
      return NextResponse.json({ error: "Some images do not exist" }, { status: 400 });
    }

    const invalid = images.find((img) => img.productId !== params.productId);
    if (invalid) {
      return NextResponse.json(
        { error: "One or more images do not belong to this product" },
        { status: 400 }
      );
    }

    await Promise.all(
      imageIds.map((id, index) =>
        prisma.productImage.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

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
  } catch {
    return NextResponse.json({ error: "Failed to reorder images" }, { status: 500 });
  }
}
