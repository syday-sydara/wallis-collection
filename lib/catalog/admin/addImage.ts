import { prisma } from "@/lib/db";

export async function adminAddImage(
  productId: string,
  file: File,
  alt: string | null
) {
  // TODO: upload file to storage (S3, Cloudflare, etc.)
  const url = `/uploads/${file.name}`;

  const maxOrder = await prisma.productImage.aggregate({
    where: { productId },
    _max: { sortOrder: true }
  });

  return prisma.productImage.create({
    data: {
      productId,
      url,
      alt,
      sortOrder: (maxOrder._max.sortOrder ?? 0) + 1
    }
  });
}