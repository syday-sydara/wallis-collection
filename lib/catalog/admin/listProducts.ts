import { prisma } from "@/lib/db";
import type { AdminProductSummary } from "./types";

export type { AdminProductSummary } from "./types";

export async function adminListProductsPaginated(args: {
  cursor?: string;
  limit?: number;
}): Promise<{ items: AdminProductSummary[]; nextCursor: string | null }> {
  const safeLimit = Math.min(args.limit ?? 20, 50);

  const items = await prisma.product.findMany({
    take: safeLimit + 1,
    skip: args.cursor ? 1 : 0,
    cursor: args.cursor ? { id: args.cursor } : undefined,
    orderBy: { createdAt: "desc" },
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

  const nextCursor = hasMore ? sliced[sliced.length - 1].id : null;

  return { items: data, nextCursor };
}