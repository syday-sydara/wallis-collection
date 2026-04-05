import { prisma } from "@/lib/db";

export async function adminCreateProduct(data: {
  name: string;
  slug: string;
  basePrice: number | null;
  description: string | null;
}) {
  return prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      basePrice: data.basePrice,
      description: data.description
    },
    select: { id: true }
  });
}