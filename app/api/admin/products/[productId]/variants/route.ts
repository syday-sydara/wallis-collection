// app/api/admin/products/[productId]/variants/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const body = await req.json();

  const variant = await prisma.productVariant.create({
    data: {
      productId: params.productId,
      name: body.name,
      sku: body.sku,
      price: body.price,
      stock: body.stock,
    },
  });

  return NextResponse.json(variant);
}
