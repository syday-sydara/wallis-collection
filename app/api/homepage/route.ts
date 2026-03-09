import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    /* ----------------------------- */
    /* Featured Products             */
    /* ----------------------------- */
    const featured = await prisma.product.findMany({
      where: { featured: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { images: true },
    });

    /* ----------------------------- */
    /* New Arrivals                  */
    /* ----------------------------- */
    const newArrivals = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { images: true },
    });

    /* ----------------------------- */
    /* Best Sellers (placeholder)    */
    /* ----------------------------- */
    const bestSellersRaw = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { images: true },
    });

    /* ----------------------------- */
    /* Mapper                        */
    /* ----------------------------- */
    const mapProduct = (p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      priceNaira: p.salePriceNaira ?? p.priceNaira,
      images: p.images.length > 0 ? [p.images[0].url] : [],
      isNew:
        p.createdAt >
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
      isOnSale: Boolean(p.salePriceNaira),
      outOfStock: p.stock <= 0,
    });

    return NextResponse.json({
      featured: featured.map(mapProduct),
      newArrivals: newArrivals.map(mapProduct),
      bestSellers: bestSellersRaw.map(mapProduct),
    });
  } catch (err) {
    console.error("Failed to fetch homepage products:", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
