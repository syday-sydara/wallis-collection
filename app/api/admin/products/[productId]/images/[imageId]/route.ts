// app/api/admin/products/[productId]/images/[imageId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(_, { params }) {
  await prisma.productImage.delete({
    where: { id: params.imageId },
  });

  return NextResponse.json({ ok: true });
}
