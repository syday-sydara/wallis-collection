// app/api/admin/products/[productId]/variants/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    const body = await req.json();
    const { name, sku, price, stock } = body;

    if (!name || !sku || price == null) {
      return NextResponse.json(
        { error: "name, sku, and price are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: params.productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const existingSku = await prisma.productVariant.findUnique({ where: { sku } });
    if (existingSku) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
    }

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
  } catch {
    return NextResponse.json({ error: "Failed to create variant" }, { status: 500 });
  }
}
