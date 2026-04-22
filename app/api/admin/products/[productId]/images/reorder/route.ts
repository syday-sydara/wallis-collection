import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    const { imageIds } = await req.json();

    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return NextResponse.json({ error: "imageIds must be a non-empty array" }, { status: 400 });
    }

    const images = await prisma.productImage.findMany({
      where: { id: { in: imageIds } },
    });

    if (images.length !== imageIds.length) {
      return NextResponse.json({ error: "Some images do not exist" }, { status: 400 });
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
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to reorder images" }, { status: 500 });
  }
}
