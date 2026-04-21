import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const { amount } = await req.json();
  const orderId = params.orderId;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const newRefunded = order.refundedAmount + amount;

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      refundedAmount: newRefunded,
      paymentStatus:
        newRefunded >= order.total ? PaymentStatus.REFUNDED : order.paymentStatus,
    },
  });

  return NextResponse.json(updated);
}
