"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function adminUpdateProduct(
  productId: string,
  data: {
    name?: string;
    slug?: string;
    description?: string | null;
    basePrice?: number | null;
  }
) {
  const updated = await prisma.product.update({
    where: { id: productId },
    data,
    select: { id: true },
  });

  revalidatePath(`/admin/products/${productId}`);
  return updated;
}
