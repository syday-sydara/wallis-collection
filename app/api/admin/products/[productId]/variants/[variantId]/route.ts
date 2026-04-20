// app/api/admin/products/[productId]/variants/[variantId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  const body = await req.json();

  const updated = await prisma.productVariant.update({
    where: { id: params.variantId },
    data: {
      name: body.name,
      sku: body.sku,
      price: body.price,
      stock: body.stock,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_, { params }) {
  await prisma.productVariant.delete({
    where: { id: params.variantId },
  });

  return NextResponse.json({ ok: true });
}
