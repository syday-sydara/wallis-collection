import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const productId = params.productId;
  const body = await req.json();
  const { imageId } = body as { imageId: string };

  if (!imageId) {
    return NextResponse.json({ error: "imageId required" }, { status: 400 });
  }

  // Clear existing primary
  await prisma.productImage.updateMany({
    where: { productId },
    data: { isPrimary: false },
  });

  // Set new primary
  await prisma.productImage.update({
    where: { id: imageId },
    data: { isPrimary: true },
  });

  return NextResponse.json({ ok: true });
}
