import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const { imageId } = await req.json();
  const productId = params.productId;

  await prisma.productImage.updateMany({
    where: { productId },
    data: { isPrimary: false },
  });

  await prisma.productImage.update({
    where: { id: imageId },
    data: { isPrimary: true },
  });

  return NextResponse.json({ ok: true });
}
