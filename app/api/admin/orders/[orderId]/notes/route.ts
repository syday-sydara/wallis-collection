import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const { message } = await req.json();
  const orderId = params.orderId;

  if (!message || message.trim().length === 0) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const note = await prisma.auditLog.create({
    data: {
      action: "ORDER_NOTE",
      actorType: "ADMIN",
      resource: "order",
      resourceId: orderId,
      metadata: { message },
    },
  });

  return NextResponse.json(note);
}
