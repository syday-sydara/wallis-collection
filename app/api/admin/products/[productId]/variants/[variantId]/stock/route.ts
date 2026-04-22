// app/api/admin/products/[productId]/variants/[variantId]/stock/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { productId: string; variantId: string } }
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
    // Ensure variant exists
    // -----------------------------
    const variant = await prisma.productVariant.findUnique({
      where: { id: params.variantId },
      select: { id: true, stock: true },
    });

    if (!variant) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      );
    }

    const previousStock = variant.stock;

    // -----------------------------
    // Update stock
    // -----------------------------
    const updated = await prisma.productVariant.update({
      where: { id: params.variantId },
      data: { stock },
    });

    // -----------------------------
    // Audit log (Shopify-style)
    // -----------------------------
    await prisma.auditLog.create({
      data: {
        action: "INVENTORY_ADJUSTMENT",
        actorType: "ADMIN",
        resource: "variant",
        resourceId: params.variantId,
        message: `Stock adjusted from ${previousStock} → ${stock}`,
        metadata: {
          previousStock,
          newStock: stock,
          difference: stock - previousStock,
        },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Stock update error:", err);
    return NextResponse.json(
      { error: "Failed to update stock" },
      { status: 500 }
    );
  }
}
