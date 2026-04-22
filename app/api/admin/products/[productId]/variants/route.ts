// app/api/admin/products/[productId]/variants/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { productId: string } }) {
  try {
    const body = await req.json();
    const { name, sku, price, stock } = body;

    // -----------------------------
    // Validate required fields
    // -----------------------------
    if (!name || !sku || price == null) {
      return NextResponse.json(
        { error: "name, sku, and price are required" },
        { status: 400 }
      );
    }

    if (typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "price must be a positive number" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Ensure product exists
    // -----------------------------
    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // -----------------------------
    // Ensure SKU is unique
    // -----------------------------
    const existingSku = await prisma.productVariant.findUnique({
      where: { sku },
      select: { id: true },
    });

    if (existingSku) {
      return NextResponse.json(
        { error: "SKU already exists" },
        { status: 409 }
      );
    }

    // -----------------------------
    // Create variant
    // -----------------------------
    const variant = await prisma.productVariant.create({
      data: {
        productId: params.productId,
        name,
        sku,
        price,
        stock: stock ?? 0,
      },
    });

    return NextResponse.json(variant);
  } catch (err) {
    console.error("Variant creation error:", err);
    return NextResponse.json(
      { error: "Failed to create variant" },
      { status: 500 }
    );
  }
}
