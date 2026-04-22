import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { status } = await req.json();
    const orderId = params.orderId;

    // -----------------------------
    // Validate status
    // -----------------------------
    if (!Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Load order
    // -----------------------------
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, orderStatus: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // -----------------------------
    // Prevent no‑op updates
    // -----------------------------
    if (order.orderStatus === status) {
      return NextResponse.json(
        { error: "Order is already in this status" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Update order status
    // -----------------------------
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: status },
    });

    // -----------------------------
    // Audit log (timeline event)
    // -----------------------------
    await prisma.auditLog.create({
      data: {
        action: "ORDER_STATUS_CHANGED",
        actorType: "ADMIN",
        resource: "order",
        resourceId: orderId,
        message: `Order status changed from ${order.orderStatus} → ${status}`,
        metadata: {
          from: order.orderStatus,
          to: status,
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (err) {
    console.error("Order status update error:", err);

    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
