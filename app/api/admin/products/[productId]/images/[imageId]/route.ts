// app/api/admin/products/[productId]/images/[imageId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { deleteImage } from "@/lib/cloudinary/delete";

export async function DELETE(_, { params }) {
  try {
    const { productId, imageId } = params;

    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (image.productId !== productId) {
      return NextResponse.json({ error: "Image does not belong to this product" }, { status: 400 });
    }

    // Delete from Cloudinary
    await deleteImage(image.publicId);

    // Delete from DB
    await prisma.productImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
