// app/api/admin/products/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor") || undefined;

    const products = await prisma.product.findMany({
      take: 20,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { updatedAt: "desc" },
    });

    const nextCursor = products.length === 20 ? products[19].id : null;

    return NextResponse.json({
      items: products,
      nextCursor,
    });
  } catch (err) {
    console.error("Product list error:", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, basePrice, stock, description } = body;

    // -----------------------------
    // Validation
    // -----------------------------
    if (!name || !slug || basePrice == null) {
      return NextResponse.json(
        { error: "name, slug, and basePrice are required" },
        { status: 400 }
      );
    }

    if (typeof basePrice !== "number" || basePrice < 0) {
      return NextResponse.json(
        { error: "basePrice must be a positive number" },
        { status: 400 }
      );
    }

    // Ensure slug is unique
    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      );
    }

    // -----------------------------
    // Create product
    // -----------------------------
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        basePrice,
        stock: stock ?? 0,
        description: description ?? "",
      },
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error("Product creation error:", err);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
