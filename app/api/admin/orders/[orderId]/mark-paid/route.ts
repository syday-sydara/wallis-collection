import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;

    // -----------------------------
    // Ensure order exists
    // -----------------------------
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // -----------------------------
    // Prevent double‑payment
    // -----------------------------
    if (order.isPaid || order.paymentStatus === PaymentStatus.SUCCESS) {
      return NextResponse.json(
        { error: "Order is already marked as paid" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Update order payment status
    // -----------------------------
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paymentStatus: PaymentStatus.SUCCESS,
      },
    });

    // -----------------------------
    // Update related payments (optional but Shopify‑style)
    // -----------------------------
    await prisma.payment.updateMany({
      where: { orderId },
      data: { status: PaymentStatus.SUCCESS },
    });

    // -----------------------------
    // Audit log entry (timeline)
    // -----------------------------
    await prisma.auditLog.create({
      data: {
        action: "PAYMENT_SUCCESS",
        actorType: "ADMIN",
        resource: "order",
        resourceId: orderId,
        message: "Order marked as paid",
        metadata: {
          previousStatus: order.paymentStatus,
          newStatus: PaymentStatus.SUCCESS,
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (err) {
    console.error("Payment update error:", err);

    return NextResponse.json(
      { error: "Failed to update payment status" },
      { status: 500 }
    );
  }
}
