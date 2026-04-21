// app/api/admin/products/[productId]/images/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { uploadToCloud } from "@/lib/upload"; // your upload logic

export async function POST(req, { params }) {
  const form = await req.formData();
  const file = form.get("file");

  const url = await uploadToCloud(file);

  const image = await prisma.productImage.create({
    data: {
      productId: params.productId,
      url,
    },
  });

  return NextResponse.json(image);
}
