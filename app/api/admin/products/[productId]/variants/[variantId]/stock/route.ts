// app/api/admin/products/[productId]/variants/[variantId]/stock/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  const body = await req.json();

  const updated = await prisma.productVariant.update({
    where: { id: params.variantId },
    data: { stock: body.stock },
  });

  return NextResponse.json(updated);
}
