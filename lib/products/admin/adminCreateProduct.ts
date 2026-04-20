import { prisma } from "@/lib/prisma";

export async function adminCreateProduct(data: {
  name: string;
  slug: string;
  basePrice: number | null;
  description: string | null;
  imageUrl?: string | null; // <-- added
}) {
  // 1. Create product
  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug: data.slug,
      basePrice: data.basePrice,
      description: data.description,
    },
    select: { id: true },
  });

  // 2. If an image was uploaded, attach it
  if (data.imageUrl) {
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: data.imageUrl,
        alt: data.name, // optional, but good default
        sortOrder: 0,
      },
    });
  }

  return product;
}
