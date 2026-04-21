import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import your storage helper here

export async function POST(
  req: Request,
  { params }: { params: { productId: string; imageId: string } }
) {
  const { productId, imageId } = params;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  // TODO: upload file to storage and get URL
  const url = await uploadToStorage(file); // implement this

  const updated = await prisma.productImage.update({
    where: { id: imageId },
    data: { url },
  });

  return NextResponse.json(updated);
}

// stub – replace with your real uploader
async function uploadToStorage(file: File): Promise<string> {
  // upload and return URL
  return "https://example.com/" + file.name;
}
