import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const placeholderImages = [
      "https://picsum.photos/600/800?random=1",
      "https://picsum.photos/600/800?random=2",
      "https://picsum.photos/600/800?random=3",
      "https://picsum.photos/600/800?random=4",
      "https://picsum.photos/600/800?random=5",
      "https://picsum.photos/600/800?random=6",
      "https://picsum.photos/600/800?random=7",
      "https://picsum.photos/600/800?random=8",
    ];

    // Featured: last 5 products marked featured
    const featured = await prisma.product.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // New Arrivals: latest 8 products
    const newArrivals = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    // Best Sellers: top 8 products (placeholder logic)
    const bestSellersRaw = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    });

    const mapProduct = (p: any, index: number) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      priceNaira: p.priceCents,
      images: [p.images?.[0] ?? placeholderImages[index % placeholderImages.length]],
      isNew: p.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isOnSale: false,
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