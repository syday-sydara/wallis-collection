import { prisma } from "@/lib/db";

export async function adminCreateVariant(
  productId: string,
  data: { name: string; sku: string; price: number; stock: number }
) {
  return prisma.productVariant.create({
    data: {
      ...data,
      productId
    }
  });
}