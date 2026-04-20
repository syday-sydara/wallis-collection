import { prisma } from "@/lib/prisma";
import type {
  ProductListParams,
  ProductListResult,
  ProductClientVM,
} from "./types";
import { toProductCardVM } from "./mappers";

/* ---------------------------------------------
 * LIST PRODUCTS (Storefront)
 * --------------------------------------------- */
export async function getProducts(
  params: ProductListParams = {}
): Promise<ProductListResult> {
  const {
    search,
    minPrice,
    maxPrice,
    includeArchived = false,
    limit = 24,
    cursor,
    sort,
  } = params;

  // Default sort: newest first
  let orderBy: any = [
    { createdAt: "desc" },
    { id: "desc" },
  ];

  // Sort by lowest variant price
  if (sort === "price-asc") {
    orderBy = [
      { variants: { _min: { price: "asc" } } },
      { id: "asc" },
    ];
  }

  // Sort by highest variant price
  if (sort === "price-desc") {
    orderBy = [
      { variants: { _max: { price: "desc" } } },
      { id: "desc" },
    ];
  }

  const products = await prisma.product.findMany({
    where: {
      isArchived: includeArchived ? undefined : false,

      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),

      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            variants: {
              some: {
                ...(minPrice !== undefined && { price: { gte: minPrice } }),
                ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
              },
            },
          }
        : {}),
    },

    take: limit + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,

    orderBy,

    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { select: { price: true, stock: true } },
    },
  });

  const hasMore = products.length > limit;
  const nextCursor = hasMore ? products[limit].id : null;

  return {
    items: products.slice(0, limit).map(toProductCardVM),
    nextCursor,
  };
}

/* ---------------------------------------------
 * PRODUCT DETAIL + RECOMMENDATIONS
 * --------------------------------------------- */
export async function getProductDetailWithRecommendations(
  slug: string
): Promise<ProductClientVM | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        select: { id: true, name: true, price: true, stock: true, sku: true },
      },
    },
  });

  if (!product || product.isArchived) return null;

  // If product has no variants, return empty recommendations
  if (product.variants.length === 0) {
    return { ...product, recommended: [] };
  }

  // Determine price range for recommendations
  const prices = product.variants.map((v) => v.price);
  const basePrice = Math.min(...prices);

  const priceMin = Math.max(basePrice * 0.8, 0);
  const priceMax = basePrice * 1.2;

  const recommendedRaw = await prisma.product.findMany({
    where: {
      id: { not: product.id },
      isArchived: false,
      variants: {
        some: {
          price: { gte: priceMin, lte: priceMax },
        },
      },
    },
    take: 6,
    orderBy: [
      { createdAt: "desc" },
      { id: "desc" },
    ],
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { select: { price: true, stock: true } },
    },
  });

  const recommended = recommendedRaw.map(toProductCardVM);

  return { ...product, recommended };
}
