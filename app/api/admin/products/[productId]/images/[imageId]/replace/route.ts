import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { uploadToCloud } from "@/lib/upload";
import { deleteImage } from "@/lib/cloudinary/delete";

export async function POST(req, { params }) {
  try {
    const { productId, imageId } = params;

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "A valid file is required" }, { status: 400 });
    }

    const existing = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (existing.productId !== productId) {
      return NextResponse.json({ error: "Image does not belong to this product" }, { status: 400 });
    }

    // Upload new image
    const uploaded = await uploadToCloud(file);

    // Delete old Cloudinary asset
    await deleteImage(existing.publicId);

    // Update DB
    const updated = await prisma.productImage.update({
      where: { id: imageId },
      data: {
        url: uploaded.url,
        publicId: uploaded.publicId,
        width: uploaded.width,
        height: uploaded.height,
        format: uploaded.format,
        bytes: uploaded.bytes,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to replace image" }, { status: 500 });
  }
}
