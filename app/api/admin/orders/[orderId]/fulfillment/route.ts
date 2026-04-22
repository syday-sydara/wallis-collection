import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { carrier, tracking } = await req.json();
    const orderId = params.orderId;

    // -----------------------------
    // Basic validation
    // -----------------------------
    if (!carrier?.trim()) {
      return NextResponse.json(
        { error: "Carrier is required" },
        { status: 400 }
      );
    }

    if (!tracking?.trim()) {
      return NextResponse.json(
        { error: "Tracking number is required" },
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
    // Create fulfillment
    // -----------------------------
    const fulfillment = await prisma.fulfillment.create({
      data: {
        orderId,
        carrier,
        tracking,
        status: "SHIPPED", // optional default
      },
    });

    // -----------------------------
    // Update order status (optional)
    // -----------------------------
    await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: "SHIPPED" },
    });

    // -----------------------------
    // Audit log entry
    // -----------------------------
    await prisma.auditLog.create({
      data: {
        action: "FULFILLMENT_CREATED",
        actorType: "ADMIN",
        resource: "order",
        resourceId: orderId,
        message: `Order shipped via ${carrier} (${tracking})`,
        metadata: { carrier, tracking },
      },
    });

    return NextResponse.json(fulfillment);
  } catch (err) {
    console.error("Fulfillment error:", err);

    return NextResponse.json(
      { error: "Failed to create fulfillment" },
      { status: 500 }
    );
  }
}
