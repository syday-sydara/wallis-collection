import { prisma } from "@/lib/db";
import { handleError, handleSuccess } from "@/lib/errors";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { images: true },
    });

    return handleSuccess(products);
  } catch (error) {
    return handleError(error);
  }
}
