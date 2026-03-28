import { prisma } from "@/lib/db";

/* ---------------------------------------------
   BASIC LIST (no pagination)
--------------------------------------------- */

export async function adminListProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true
    }
  });
}

/* ---------------------------------------------
   PAGINATED LIST (with search, filters, sorting)
--------------------------------------------- */

export async function adminListProductsPaginated(args: {
  cursor?: string;
  limit?: number;
  search?: string;
  archived?: boolean;
  categoryId?: string;
  sort?: "createdAt" | "updatedAt" | "name" | "basePrice";
  direction?: "asc" | "desc";
}) {
  const {
    cursor,
    limit = 20,
    search,
    archived,
    categoryId,
    sort = "createdAt",
    direction = "desc"
  } = args;

  const items = await prisma.product.findMany({
    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,

    orderBy: { [sort]: direction },

    where: {
      ...(search
        ? { name: { contains: search, mode: "insensitive" } }
        : {}),

      ...(archived !== undefined
        ? { isArchived: archived }
        : {}),

      ...(categoryId
        ? { categoryId }
        : {})
    },

    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      stock: true,
      isArchived: true,
      updatedAt: true,

      // First image thumbnail
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: {
          id: true,
          url: true,
          alt: true
        }
      }
    }
  });

  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, -1) : items;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { items: data, nextCursor };
}

/* ---------------------------------------------
   GET PRODUCT (full details)
--------------------------------------------- */

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

/* ---------------------------------------------
   GET PRODUCT + PAGINATED INVENTORY
--------------------------------------------- */

export async function adminGetProductWithInventory(
  id: string,
  inventoryCursor?: string,
  limit = 20,
  options?: {
    search?: string;
    type?: "increase" | "decrease" | "all";
    sort?: "createdAt" | "change";
    direction?: "asc" | "desc";
  }
) {
  const { search, type = "all", sort = "createdAt", direction = "desc" } =
    options ?? {};

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true
    }
  });

  if (!product) return null;

  const movements = await prisma.inventoryMovement.findMany({
    where: {
      productId: id,

      ...(search
        ? { reason: { contains: search, mode: "insensitive" } }
        : {}),

      ...(type === "increase"
        ? { change: { gt: 0 } }
        : type === "decrease"
        ? { change: { lt: 0 } }
        : {})
    },

    take: limit + 1,
    skip: inventoryCursor ? 1 : 0,
    cursor: inventoryCursor ? { id: inventoryCursor } : undefined,

    orderBy: { [sort]: direction }
  });

  const hasMore = movements.length > limit;
  const data = hasMore ? movements.slice(0, -1) : movements;
  const nextCursor = hasMore ? data[data.length - 1].id : null;

  return { product, movements: data, nextCursor };
}