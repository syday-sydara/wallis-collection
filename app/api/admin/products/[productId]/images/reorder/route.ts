import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const { imageIds } = await req.json();

  await Promise.all(
    imageIds.map((id: string, index: number) =>
      prisma.productImage.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
