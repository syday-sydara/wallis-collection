// app/api/admin/products/[productId]/inventory/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    const body = await req.json();
    const { stock } = body;

    if (typeof stock !== "number" || stock < 0) {
      return NextResponse.json(
        { error: "Stock must be a non-negative number" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      select: { stock: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updated = await prisma.product.update({
      where: { id: params.productId },
      data: { stock },
    });

    await prisma.auditLog.create({
      data: {
        action: "INVENTORY_ADJUSTMENT",
        actorType: "ADMIN",
        resource: "product",
        resourceId: params.productId,
        message: `Product stock adjusted from ${product.stock} → ${stock}`,
        metadata: {
          previousStock: product.stock,
          newStock: stock,
          difference: stock - product.stock,
        },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update product stock" }, { status: 500 });
  }
}
