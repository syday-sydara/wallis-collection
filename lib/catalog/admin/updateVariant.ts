import { prisma } from "@/lib/db";

export async function adminUpdateVariant(
  variantId: string,
  data: { name: string; sku: string; price: number }
) {
  return prisma.productVariant.update({
    where: { id: variantId },
    data
  });
}