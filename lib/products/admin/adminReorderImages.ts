"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function adminReorderImages(productId: string, ids: string[]) {
  await Promise.all(
    ids.map((id, index) =>
      prisma.productImage.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  revalidatePath(`/admin/product/${productId}`);
  return { ok: true };
}
