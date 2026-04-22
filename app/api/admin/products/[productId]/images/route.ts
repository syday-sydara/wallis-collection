// app/api/admin/products/[productId]/images/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { uploadToCloud } from "@/lib/upload";

export async function POST(req, { params }) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "A valid file is required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: params.productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const url = await uploadToCloud(file);

    const image = await prisma.productImage.create({
      data: {
        productId: params.productId,
        url,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "PRODUCT_IMAGE_ADDED",
        actorType: "ADMIN",
        resource: "product",
        resourceId: params.productId,
        message: "Product image uploaded",
        metadata: { url },
      },
    });

    return NextResponse.json(image);
  } catch {
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
