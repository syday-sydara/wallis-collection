// lib/catalog/admin.ts

import { prisma } from "@/lib/db";

export async function adminListProductsPaginated(args: {
  cursor?: string;
  limit?: number;
}) {
  const { cursor, limit = 20 } = args;
  const items = await prisma.product.findMany({
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      stock: true,
      isArchived: true,
      updatedAt: true
    }
  });

  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, -1) : items;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { items: data, nextCursor };
}

export async function adminGetProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      inventory: {
        orderBy: { createdAt: "desc" },
        take: 20
      }
    }
  });
}

export async function adminGetProductWithInventory(
  id: string,
  inventoryCursor?: string,
  limit = 20
) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true
    }
  });
  if (!product) return null;

  const movements = await prisma.inventoryMovement.findMany({
    where: { productId: id },
    take: limit + 1,
    skip: inventoryCursor ? 1 : 0,
    cursor: inventoryCursor ? { id: inventoryCursor } : undefined,
    orderBy: { createdAt: "desc" }
  });

  const hasMore = movements.length > limit;
  const data = hasMore ? movements.slice(0, -1) : movements;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { product, movements: data, nextCursor };
}
