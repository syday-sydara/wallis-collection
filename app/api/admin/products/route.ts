// app/api/admin/products/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor") || undefined;

  const products = await prisma.product.findMany({
    take: 20,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { updatedAt: "desc" },
  });

  const nextCursor = products.length === 20 ? products[19].id : null;

  return NextResponse.json({ items: products, nextCursor });
}

export async function POST(req: Request) {
  const body = await req.json();

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      basePrice: body.basePrice,
      stock: body.stock ?? 0,
      description: body.description ?? "",
    },
  });

  return NextResponse.json(product);
}
