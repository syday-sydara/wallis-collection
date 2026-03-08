import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Convert JSON fields if needed
    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      priceNaira: p.priceNaira,
      images: p.images as string[],
      isNew: p.isNew ?? false,
      isOnSale: p.isOnSale ?? false,
      outOfStock: p.stock <= 0,
    }));

    return new Response(JSON.stringify(formatted), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch products" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}