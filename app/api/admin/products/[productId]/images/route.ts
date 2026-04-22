// app/api/admin/products/[productId]/images/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { uploadToCloud } from "@/lib/upload";

export async function POST(req, { params }) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const alt = form.get("alt")?.toString() ?? null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "A valid file is required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: params.productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const uploaded = await uploadToCloud(file);

    const image = await prisma.productImage.create({
      data: {
        productId: params.productId,
        url: uploaded.url,
        publicId: uploaded.publicId,
        width: uploaded.width,
        height: uploaded.height,
        format: uploaded.format,
        bytes: uploaded.bytes,
        alt,
      },
    });

    return NextResponse.json(image);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
