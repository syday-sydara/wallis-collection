import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const { status } = await req.json();
  const orderId = params.orderId;

  if (!Object.values(OrderStatus).includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { orderStatus: status },
  });

  return NextResponse.json(order);
}
