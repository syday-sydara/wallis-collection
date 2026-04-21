// app/api/admin/orders/[id]/status/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canTransition, type OrderStatus } from "@/lib/orders/orderStatus";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const body = await req.json().catch(() => null);

  const nextStatus = body?.status as OrderStatus | undefined;
  if (!nextStatus) {
    return NextResponse.json({ error: "Missing status" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    select: { orderStatus: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!canTransition(order.orderStatus as OrderStatus, nextStatus)) {
    return NextResponse.json(
      { error: "Invalid status transition" },
      { status: 400 }
    );
  }

  await prisma.order.update({
    where: { id },
    data: { orderStatus: nextStatus },
  });

  return NextResponse.json({ ok: true });
}
