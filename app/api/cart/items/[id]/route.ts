import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/items/:id
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const item = await prisma.item.findUnique({
    where: { id: params.id },
  });

  if (!item) {
    return NextResponse.json(
      { success: false, error: "Item not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: item });
}

// PATCH /api/items/:id
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const updated = await prisma.item.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Update failed" },
      { status: 400 }
    );
  }
}

// DELETE /api/items/:id
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.item.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 400 }
    );
  }
}
