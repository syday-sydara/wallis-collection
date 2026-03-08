// app/api/products/route.ts
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch products from DB
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 50, // optional: limit number of products for performance
    });

    // Map DB fields to frontend-friendly Product type
    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      priceNaira: p.priceCents, // use cents as number
      images: Array.isArray(p.images) ? p.images : [], // ensure array
      isNew: p.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // mark new if created in last 7 days
      isOnSale: false, // you can implement logic if you have a sale field
      outOfStock: p.stock <= 0,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error fetching products:", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}