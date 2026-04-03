import { prisma } from "@/lib/db";

export async function adminReorderImages(
  productId: string,
  newOrder: string[]
) {
  await prisma.$transaction(
    newOrder.map((id, index) =>
      prisma.productImage.update({
        where: { id },
        data: { sortOrder: index }
      })
    )
  );
}