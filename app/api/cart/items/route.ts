import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/items
export async function GET() {
  const items = await prisma.item.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: items });
}

// POST /api/items
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const created = await prisma.item.create({
      data: body,
    });

    return NextResponse.json({ success: true, data: created });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Create failed" },
      { status: 400 }
    );
  }
}
