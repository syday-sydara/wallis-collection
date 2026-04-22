import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string; id: string }> }
) {
  const { orderId, id } = await params;
  const { status } = await req.json();

  const fulfillment = await prisma.fulfillment.update({
    where: { id },
    data: { status },
  });

  await prisma.auditLog.create({
    data: {
      action: "FULFILLMENT_STATUS",
      actorType: "ADMIN",
      resource: "fulfillment",
      resourceId: id,
      metadata: { status },
    },
  });

  return NextResponse.json(fulfillment);
}
