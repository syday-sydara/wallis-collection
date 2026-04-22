import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveLocalImage } from "@/lib/storage/local";
import fs from "fs/promises";
import path from "path";

export async function POST(req, { params }) {
  try {
    const { productId, imageId } = params;

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "A valid file is required" },
        { status: 400 }
      );
    }

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

    const newUrl = await saveLocalImage(productId, file);

    if (image.url.startsWith("/uploads/")) {
      const oldPath = path.join(process.cwd(), "public", image.url);
      try {
        await fs.unlink(oldPath);
      } catch {}
    }

    const updated = await prisma.productImage.update({
      where: { id: imageId },
      data: { url: newUrl },
    });

    await prisma.auditLog.create({
      data: {
        action: "PRODUCT_IMAGE_REPLACED",
        actorType: "ADMIN",
        resource: "product",
        resourceId: productId,
        message: "Product image replaced",
        metadata: {
          imageId,
          oldUrl: image.url,
          newUrl,
        },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Replace image error:", err);
    return NextResponse.json(
      { error: "Failed to replace image" },
      { status: 500 }
    );
  }
}
