import { prisma } from "@/lib/db";
import { ApiError, handleError, handleSuccess } from "@/lib/errors";

export async function GET(req, { params }) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: { images: true, reviews: true },
    });

    if (!product) throw ApiError.notFound("Product not found");

    return handleSuccess(product);
  } catch (error) {
    return handleError(error);
  }
}
