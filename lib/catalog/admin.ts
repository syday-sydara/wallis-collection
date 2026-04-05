import { prisma } from "@/lib/db";
import type { AdminProductDetail, AdminProductSummary } from "./admin";
import { toAdminProductDetail, toAdminProductSummary } from "./admin/admin-mappers";

/**
 * List products for admin (paginated)
 */
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
    include: { variants: true } // only need variants for stock
  });

  const hasMore = items.length > safeLimit;
  const sliced = hasMore ? items.slice(0, safeLimit) : items;

  return {
    items: sliced.map(toAdminProductSummary),
    nextCursor: hasMore ? sliced[safeLimit - 1].id : null
  };
}

/**
 * Get detailed product for admin
 */
export async function adminGetProduct(id: string): Promise<AdminProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true,
      images: true
    }
  });

  if (!product) return null;

  return toAdminProductDetail(product);
}