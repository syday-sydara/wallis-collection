import { prisma } from "@/lib/db";

export async function adminUpdateProduct(
  productId: string,
  data: { name: string; slug: string; description: string | null; basePrice: number | null }
) {
  return prisma.product.update({ where: { id: productId }, data });
}