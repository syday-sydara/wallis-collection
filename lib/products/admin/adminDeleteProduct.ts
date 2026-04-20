"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function adminDeleteProduct(productId: string) {
  await prisma.product.update({
    where: { id: productId },
    data: { isArchived: true },
  });

  revalidatePath("/admin/products");
  return { ok: true };
}
