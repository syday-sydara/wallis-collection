// lib/catalog/admin.ts

import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

// --- Types
export type AdminProductSummary = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  stock: number;
  isArchived: boolean;
  updatedAt: Date;
};

export type AdminProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  stock: number;
  isArchived: boolean;
  updatedAt: Date;
  images: { id: string; url: string; alt: string | null; sortOrder: number }[];
  variants: { id: string; name: string; sku: string; price: number; stock: number }[];
};

export async function adminListProductsPaginated(args: {
  cursor?: string;
  limit?: number;
}): Promise<{ items: AdminProductSummary[]; nextCursor: string | null }> {
  const safeLimit = Math.min(args.limit ?? 20, 50);

  const items = await prisma.product.findMany({
    take: safeLimit + 1,
    skip: args.cursor ? 1 : 0,
    cursor: args.cursor ? { id: args.cursor } : undefined,
    orderBy: [
      { createdAt: "desc" },
      { id: "desc" }
    ],
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      isArchived: true,
      updatedAt: true,
      variants: {
        select: { stock: true }
      }
    }
  });

  const hasMore = items.length > safeLimit;
  const sliced = hasMore ? items.slice(0, -1) : items;

  const data: AdminProductSummary[] = sliced.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    basePrice: p.basePrice,
    stock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    isArchived: p.isArchived,
    updatedAt: p.updatedAt
  }));

  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { items: data, nextCursor };
}

export async function adminGetProduct(id: string): Promise<AdminProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      basePrice: true,
      isArchived: true,
      updatedAt: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          url: true,
          alt: true,
          sortOrder: true
        }
      },
      variants: {
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          stock: true
        }
      }
    }
  });

  if (!product) return null;

  const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  return {
    ...product,
    stock
  };
}

export async function adminGetProductWithInventory(
  id: string,
  inventoryCursor?: string,
  limit = 20
): Promise<{
  product: AdminProductDetail;
  movements: Prisma.InventoryMovementGetPayload<{}>[];
  nextCursor: string | null;
} | null> {
  const safeLimit = Math.min(limit, 50);

  const [product, movements] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        basePrice: true,
        isArchived: true,
        updatedAt: true,
        images: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            url: true,
            alt: true,
            sortOrder: true
          }
        },
        variants: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stock: true
          }
        }
      }
    }),
    prisma.inventoryMovement.findMany({
      where: { productId: id },
      take: safeLimit + 1,
      skip: inventoryCursor ? 1 : 0,
      cursor: inventoryCursor ? { id: inventoryCursor } : undefined,
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" }
      ]
    })
  ]);

  if (!product) return null;

  const stock = product.variants.reduce((sum, v) => sum + v.stock, 0);

  const hasMore = movements.length > safeLimit;
  const data = hasMore ? movements.slice(0, -1) : movements;

  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return {
    product: { ...product, stock },
    movements: data,
    nextCursor
  };
}