// app/api/admin/products/[productId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { productId: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      include: { images: true, variants: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error("GET product error:", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { productId: string } }) {
  try {
    const body = await req.json();
    const { name, slug, basePrice, description } = body;

    // -----------------------------
    // Ensure product exists
    // -----------------------------
    const existing = await prisma.product.findUnique({
      where: { id: params.productId },
      select: { id: true, slug: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // -----------------------------
    // Validate slug uniqueness
    // -----------------------------
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 409 }
        );
      }
    }

    // -----------------------------
    // Update product
    // -----------------------------
    const updated = await prisma.product.update({
      where: { id: params.productId },
      data: {
        name: name ?? undefined,
        slug: slug ?? undefined,
        basePrice: basePrice ?? undefined,
        description: description ?? undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH product error:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { productId: string } }) {
  try {
    // Ensure product exists
    const existing = await prisma.product.findUnique({
      where: { id: params.productId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id: params.productId },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE product error:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
