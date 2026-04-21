import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const orderId = params.orderId;

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      isPaid: true,
      paymentStatus: PaymentStatus.SUCCESS,
    },
  });

  return NextResponse.json(order);
}
