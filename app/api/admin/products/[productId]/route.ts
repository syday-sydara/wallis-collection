// app/api/admin/products/[productId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  const product = await prisma.product.findUnique({
    where: { id: params.productId },
    include: { images: true, variants: true },
  });

  return NextResponse.json(product);
}

export async function PATCH(req, { params }) {
  const body = await req.json();

  const updated = await prisma.product.update({
    where: { id: params.productId },
    data: {
      name: body.name,
      slug: body.slug,
      basePrice: body.basePrice,
      description: body.description,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_, { params }) {
  await prisma.product.delete({
    where: { id: params.productId },
  });

  return NextResponse.json({ ok: true });
}
