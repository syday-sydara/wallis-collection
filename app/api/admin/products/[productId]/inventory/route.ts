// app/api/admin/products/[productId]/inventory/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  const body = await req.json();

  const updated = await prisma.product.update({
    where: { id: params.productId },
    data: { stock: body.stock },
  });

  return NextResponse.json(updated);
}
