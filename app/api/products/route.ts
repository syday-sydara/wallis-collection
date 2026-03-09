import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const search = searchParams.get("q") || undefined;
    const featured = searchParams.get("featured") === "true";
    const onSale = searchParams.get("onSale") === "true";
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);

    const skip = (page - 1) * limit;

    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        category,
        brand,
        featured: featured || undefined,
        isOnSale: onSale || undefined,
        OR: search
          ? [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: { images: true },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
