// app/api/admin/products/[productId]/images/[imageId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function DELETE(_: Request, { params }) {
  try {
    const { productId, imageId } = params;

    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
      select: { url: true, productId: true },
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

    await prisma.productImage.delete({ where: { id: imageId } });

    if (image.url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", image.url);
      try {
        await fs.unlink(filePath);
      } catch {}
    }

    await prisma.auditLog.create({
      data: {
        action: "PRODUCT_IMAGE_DELETED",
        actorType: "ADMIN",
        resource: "product",
        resourceId: productId,
        message: "Product image deleted",
        metadata: { imageId, url: image.url },
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
