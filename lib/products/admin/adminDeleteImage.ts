"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function adminDeleteImage(productId: string, imageId: string) {
  // Delete the image
  await prisma.productImage.delete({
    where: { id: imageId },
  });

  // Reorder remaining images
  const remaining = await prisma.productImage.findMany({
    where: { productId },
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  });

  await Promise.all(
    remaining.map((img, index) =>
      prisma.productImage.update({
        where: { id: img.id },
        data: { sortOrder: index },
      })
    )
  );

  revalidatePath(`/admin/product/${productId}`);
  return { ok: true };
}
