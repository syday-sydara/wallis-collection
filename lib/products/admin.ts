// lib/products/admin.ts
import { prisma } from "@/lib/db"; // Adjust to your DB instance

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
  return prisma.variant.create({
    data: {
      productId,
      ...data,
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
  return prisma.variant.update({
    where: { id: variantId },
    data,
  });
}

// ------------------------------
// Delete Variant
// ------------------------------
export async function adminDeleteVariant(variantId: string) {
  return prisma.variant.delete({
    where: { id: variantId },
  });
}

// ------------------------------
// Add Image
// ------------------------------
export async function adminAddImage(productId: string, file: File, alt: string | null) {
  // Assuming you have a file upload service in place
  const imageUrl = await uploadImage(file); // Replace with actual image upload logic
  return prisma.image.create({
    data: {
      productId,
      url: imageUrl,
      alt: alt ?? "",
    },
  });
}

// ------------------------------
// Delete Image
// ------------------------------
export async function adminDeleteImage(imageId: string) {
  return prisma.image.delete({
    where: { id: imageId },
  });
}

// ------------------------------
// Reorder Images
// ------------------------------
export async function adminReorderImages(productId: string, newOrder: string[]) {
  return prisma.image.updateMany({
    where: {
      productId,
    },
    data: newOrder.map((id, index) => ({
      where: { id },
      data: { order: index },
    })),
  });
}

// ------------------------------
// Adjust Stock
// ------------------------------
export async function adjustProductStock(data: {
  variantId: string;
  change: number;
  reason?: string;
}) {
  return prisma.variant.update({
    where: { id: data.variantId },
    data: {
      stock: {
        increment: data.change,
      },
    },
  });
}