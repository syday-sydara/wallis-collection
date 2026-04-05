// lib/products/admin.ts
import { prisma } from "@/lib/db";

// ------------------------------
// Update Product
// ------------------------------
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
    },
  });
}

// ------------------------------
// Create Variant
// ------------------------------
export async function adminCreateVariant(
  productId: string,
  data: {
    name: string;
    sku: string;
    price: number;
    stock: number;
  }
) {
  return prisma.productVariant.create({
    data: {
      productId,
      name: data.name,
      sku: data.sku,
      price: data.price,
      stock: data.stock,
      reservedStock: 0,
    },
    select: {
      id: true,
      name: true,
      sku: true,
      price: true,
      stock: true,
      reservedStock: true,
    },
  });
}

// ------------------------------
// Update Variant
// ------------------------------
export async function adminUpdateVariant(
  variantId: string,
  data: {
    name: string;
    sku: string;
    price: number;
  }
) {
  return prisma.productVariant.update({
    where: { id: variantId },
    data,
    select: {
      id: true,
      name: true,
      sku: true,
      price: true,
      stock: true,
      reservedStock: true,
    },
  });
}

// ------------------------------
// Delete Variant
// ------------------------------
export async function adminDeleteVariant(variantId: string) {
  return prisma.productVariant.delete({
    where: { id: variantId },
  });
}

// ------------------------------
// Add Image
// ------------------------------
export async function adminAddImage(
  productId: string,
  url: string,
  alt: string | null
) {
  return prisma.productImage.create({
    data: {
      productId,
      url,
      alt: alt ?? "",
    },
    select: {
      id: true,
      url: true,
      alt: true,
      sortOrder: true,
    },
  });
}

// ------------------------------
// Delete Image
// ------------------------------
export async function adminDeleteImage(imageId: string) {
  return prisma.productImage.delete({
    where: { id: imageId },
  });
}

// ------------------------------
// Reorder Images
// ------------------------------
export async function adminReorderImages(
  productId: string,
  newOrder: string[]
) {
  // Must update each image individually — updateMany cannot take multiple WHERE clauses
  const updates = newOrder.map((id, index) =>
    prisma.productImage.update({
      where: { id },
      data: { sortOrder: index },
    })
  );

  await prisma.$transaction(updates);

  return { success: true };
}

// ------------------------------
// Adjust Stock (with StockLog)
// ------------------------------
export async function adjustProductStock({
  variantId,
  change,
  reason = "Manual adjustment",
}: {
  variantId: string;
  change: number;
  reason?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.productVariant.update({
      where: { id: variantId },
      data: {
        stock: { increment: change },
      },
      select: {
        id: true,
        stock: true,
      },
    });

    await tx.stockLog.create({
      data: {
        variantId,
        change,
        reason,
      },
    });

    return updated;
  });
}

// ------------------------------
// List Products (Paginated)
// ------------------------------
export async function adminListProductsPaginated({
  cursor,
  limit = 20,
}: {
  cursor?: string | null;
  limit?: number;
}) {
  const decodedCursor = cursor ?? undefined;

  const products = await prisma.product.findMany({
    take: limit + 1,
    skip: decodedCursor ? 1 : 0,
    cursor: decodedCursor ? { id: decodedCursor } : undefined,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      isArchived: true,
      updatedAt: true,
      variants: {
        select: { stock: true },
      },
    },
  });

  let nextCursor: string | undefined = undefined;

  if (products.length > limit) {
    const nextItem = products.pop();
    nextCursor = nextItem?.id;
  }

  const items = products.map((p) => ({
    ...p,
    stock: p.variants.reduce((sum, v) => sum + v.stock, 0),
  }));

  return { items, nextCursor };
}

// ------------------------------
// Create Product (with optional image)
// ------------------------------
export async function adminCreateProduct(data: {
  name: string;
  slug: string;
  description: string | null;
  basePrice: number | null;
  image?: File | null;
}) {
  const { name, slug, description, basePrice, image } = data;

  // Ensure slug is unique
  const existing = await prisma.product.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existing) {
    throw new Error("A product with this slug already exists");
  }

  return prisma.$transaction(async (tx) => {
    // 1. Create product
    const product = await tx.product.create({
      data: {
        name,
        slug,
        description,
        basePrice,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        basePrice: true,
      },
    });

    // 2. Optional image upload
    if (image) {
      // You must implement this yourself
      const uploadedUrl = await uploadProductImage(image);

      await tx.productImage.create({
        data: {
          productId: product.id,
          url: uploadedUrl,
          alt: `${product.name} image`,
          sortOrder: 0,
        },
      });
    }

    return product;
  });
}