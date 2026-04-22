import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    const { imageId } = await req.json();
    const productId = params.productId;

    if (!imageId) {
      return NextResponse.json({ error: "imageId is required" }, { status: 400 });
    }

    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
      select: { productId: true },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (image.productId !== productId) {
      return NextResponse.json(
        { error: "Image does not belong to this product" },
        { status: 400 }
      );
    }

    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });

    await prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });

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
  } catch {
    return NextResponse.json({ error: "Failed to set primary image" }, { status: 500 });
  }
}
