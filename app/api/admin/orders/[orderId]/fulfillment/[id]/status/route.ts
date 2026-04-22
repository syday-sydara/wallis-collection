import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { orderId: string; id: string } }
) {
  try {
    const { orderId, id } = params;
    const { status } = await req.json();

    // -----------------------------
    // Validation
    // -----------------------------
    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // Ensure fulfillment exists
    const existing = await prisma.fulfillment.findUnique({
      where: { id },
      select: { id: true, orderId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Fulfillment not found" },
        { status: 404 }
      );
    }

    // -----------------------------
    // Update fulfillment
    // -----------------------------
    const fulfillment = await prisma.fulfillment.update({
      where: { id },
      data: { status },
    });

    // -----------------------------
    // Optional: Sync order status
    // Shopify does this automatically
    // -----------------------------
    if (status === "DELIVERED") {
      await prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: "DELIVERED" },
      });
    }

    if (status === "CANCELLED") {
      await prisma.order.update({
        where: { id: orderId },
        data: { orderStatus: "CANCELLED" },
      });
    }

    // -----------------------------
    // Audit log entry
    // -----------------------------
    await prisma.auditLog.create({
      data: {
        action: "FULFILLMENT_STATUS",
        actorType: "ADMIN",
        resource: "fulfillment",
        resourceId: id,
        message: `Fulfillment marked as ${status}`,
        metadata: { status },
      },
    });

    return NextResponse.json(fulfillment);
  } catch (err) {
    console.error("Fulfillment status update error:", err);

    return NextResponse.json(
      { error: "Failed to update fulfillment status" },
      { status: 500 }
    );
  }
}
