import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { status } = await req.json();

  const fulfillment = await prisma.fulfillment.update({
    where: { id: params.id },
    data: { status },
  });

  await prisma.auditLog.create({
    data: {
      action: "FULFILLMENT_STATUS",
      actorType: "ADMIN",
      resource: "fulfillment",
      resourceId: params.id,
      metadata: { status },
    },
  });

  return NextResponse.json(fulfillment);
}
