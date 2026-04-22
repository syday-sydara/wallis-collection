// app/api/admin/products/[productId]/variants/[variantId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { productId: string; variantId: string } }
) {
  try {
    const body = await req.json();
    const { name, sku, price, stock } = body;

    // -----------------------------
    // Ensure variant exists
    // -----------------------------
    const existing = await prisma.productVariant.findUnique({
      where: { id: params.variantId },
      select: { id: true, sku: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      );
    }

    // -----------------------------
    // Validate SKU uniqueness
    // -----------------------------
    if (sku && sku !== existing.sku) {
      const skuExists = await prisma.productVariant.findUnique({
        where: { sku },
        select: { id: true },
      });

      if (skuExists) {
        return NextResponse.json(
          { error: "SKU already exists" },
          { status: 409 }
        );
      }
    }

    // -----------------------------
    // Update variant
    // -----------------------------
    const updated = await prisma.productVariant.update({
      where: { id: params.variantId },
      data: {
        name: name ?? undefined,
        sku: sku ?? undefined,
        price: price ?? undefined,
        stock: stock ?? undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Variant update error:", err);
    return NextResponse.json(
      { error: "Failed to update variant" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { productId: string; variantId: string } }
) {
  try {
    // Ensure variant exists
    const existing = await prisma.productVariant.findUnique({
      where: { id: params.variantId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      );
    }

    await prisma.productVariant.delete({
      where: { id: params.variantId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Variant delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete variant" },
      { status: 500 }
    );
  }
}
