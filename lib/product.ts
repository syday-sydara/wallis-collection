// types/products.ts
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/* ---------------------------------- */
/* Product Types (Prisma-powered)     */
/* ---------------------------------- */

export const productSelect = Prisma.validator<Prisma.ProductSelect>()({
  id: true,
  slug: true,
  name: true,
  description: true,
  priceNaira: true,
  salePriceNaira: true,
  category: true,
  stock: true,
  images: {
    select: {
      url: true,
      position: true,
    },
  },
});

export type Product = Prisma.ProductGetPayload<{
  select: typeof productSelect;
}>;

/* ---------------------------------- */
/* Product Query Helpers              */
/* ---------------------------------- */

export async function getAllProducts(): Promise<Product[]> {
  return prisma.product.findMany({
    select: productSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductBySlug(
  slug: string
): Promise<Product | null> {
  return prisma.product.findUnique({
    where: { slug },
    select: productSelect,
  });
}
