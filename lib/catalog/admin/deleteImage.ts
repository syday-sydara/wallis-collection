import { prisma } from "@/lib/db";

export async function adminDeleteImage(imageId: string) {
  return prisma.productImage.delete({
    where: { id: imageId }
  });
}