import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveLocalImage } from "@/lib/storage/local";

export async function POST(
  req: Request,
  { params }: { params: { productId: string; imageId: string } }
) {
  const { productId, imageId } = params;
  const formData = await req.formData();
  const file = formData.get("file") as File;

  const url = await saveLocalImage(productId, file);

  const updated = await prisma.productImage.update({
    where: { id: imageId },
    data: { url },
  });

  return NextResponse.json(updated);
}
