import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const { carrier, tracking } = await req.json();

  const fulfillment = await prisma.fulfillment.create({
    data: {
      orderId: params.orderId,
      carrier,
      tracking,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "FULFILLMENT_CREATED",
      actorType: "ADMIN",
      resource: "order",
      resourceId: params.orderId,
      metadata: { carrier, tracking },
    },
  });

  return NextResponse.json(fulfillment);
}
