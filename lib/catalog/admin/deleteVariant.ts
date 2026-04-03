import { prisma } from "@/lib/db";

export async function adminDeleteVariant(variantId: string) {
  return prisma.productVariant.delete({
    where: { id: variantId }
  });
}