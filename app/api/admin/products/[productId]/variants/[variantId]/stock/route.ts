// app/api/admin/products/[productId]/variants/[variantId]/stock/route.ts
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

    const variant = await prisma.productVariant.findUnique({
      where: { id: params.variantId },
      select: { stock: true },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const updated = await prisma.productVariant.update({
      where: { id: params.variantId },
      data: { stock },
    });

    await prisma.auditLog.create({
      data: {
        action: "INVENTORY_ADJUSTMENT",
        actorType: "ADMIN",
        resource: "variant",
        resourceId: params.variantId,
        message: `Stock adjusted from ${variant.stock} → ${stock}`,
        metadata: {
          previousStock: variant.stock,
          newStock: stock,
          difference: stock - variant.stock,
        },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}
