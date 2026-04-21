"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function adminAddImage(
  productId: string,
  url: string,
  alt: string | null = null
) {
  const count = await prisma.productImage.count({
    where: { productId },
  });

  const image = await prisma.productImage.create({
    data: {
      productId,
      url,
      alt,
      sortOrder: count, // append to end
    },
    select: { id: true },
  });

  revalidatePath(`/admin/products/${productId}`);
  return image;
}
