import { prisma } from "@/lib/prisma";

export async function adminUpdateProduct(
  productId: string,
  data: {
    name: string;
    slug: string;
    description: string | null;
    basePrice: number | null;
  }
) {
  return prisma.product.update({
    where: { id: productId },
    data,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      basePrice: true,
      updatedAt: true,
      isArchived: true,
    },
  });
}
