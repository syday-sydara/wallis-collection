// app/api/admin/products/[productId]/inventory/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const body = await req.json();
    const { stock } = body;

    // -----------------------------
    // Validate stock
    // -----------------------------
    if (typeof stock !== "number" || stock < 0) {
      return NextResponse.json(
        { error: "Stock must be a non-negative number" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Ensure product exists
    // -----------------------------
    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      select: { id: true, stock: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const previousStock = product.stock;

    // -----------------------------
    // Update stock
    // -----------------------------
    const updated = await prisma.product.update({
      where: { id: params.productId },
      data: { stock },
    });

    // -----------------------------
    // Audit log (Shopify-style)
    // -----------------------------
    await prisma.auditLog.create({
      data: {
        action: "INVENTORY_ADJUSTMENT",
        actorType: "ADMIN",
        resource: "product",
        resourceId: params.productId,
        message: `Product stock adjusted from ${previousStock} → ${stock}`,
        metadata: {
          previousStock,
          newStock: stock,
          difference: stock - previousStock,
        },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Product stock update error:", err);
    return NextResponse.json(
      { error: "Failed to update product stock" },
      { status: 500 }
    );
  }
}
