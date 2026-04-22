import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { message } = await req.json();
    const orderId = params.orderId;

    // -----------------------------
    // Validation
    // -----------------------------
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message required" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Ensure order exists
    // -----------------------------
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // -----------------------------
    // Create note (audit log entry)
    // -----------------------------
    const note = await prisma.auditLog.create({
      data: {
        action: "ORDER_NOTE",
        actorType: "ADMIN",
        resource: "order",
        resourceId: orderId,
        message, // important for timeline display
        metadata: { message },
      },
    });

    return NextResponse.json(note);
  } catch (err) {
    console.error("Order note error:", err);

    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
