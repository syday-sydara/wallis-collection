// app/api/admin/products/[productId]/images/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { uploadToCloud } from "@/lib/upload"; // your upload logic

export async function POST(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    // -----------------------------
    // Validate file
    // -----------------------------
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "A valid file is required" },
        { status: 400 }
      );
    }

    // Optional: Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WEBP images are allowed" },
        { status: 400 }
      );
    }

    // Optional: Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
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
    // Upload to cloud storage
    // -----------------------------
    const url = await uploadToCloud(file);

    // -----------------------------
    // Save image record
    // -----------------------------
    const image = await prisma.productImage.create({
      data: {
        productId: params.productId,
        url,
      },
    });

    // -----------------------------
    // Audit log (Shopify-style)
    // -----------------------------
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
  } catch (err) {
    console.error("Image upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
