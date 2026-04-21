import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const productId = params.productId;
  const body = await req.json();
  const { imageIds } = body as { imageIds: string[] };

  if (!Array.isArray(imageIds) || imageIds.length === 0) {
    return NextResponse.json({ error: "imageIds required" }, { status: 400 });
  }

  await Promise.all(
    imageIds.map((id, index) =>
      prisma.productImage.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
