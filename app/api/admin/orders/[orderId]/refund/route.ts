import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { amount } = await req.json();
    const orderId = params.orderId;

    // -----------------------------
    // Validate amount
    // -----------------------------
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Refund amount must be a positive number" },
        { status: 400 }
      );
    }

    // -----------------------------
    // Load order
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

    const refundableRemaining = order.total - order.refundedAmount;

    // -----------------------------
    // Prevent over‑refund
    // -----------------------------
    if (amount > refundableRemaining) {
      return NextResponse.json(
        {
          error: `Refund exceeds remaining refundable amount (₦${refundableRemaining / 100})`,
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // Compute new refund total
    // -----------------------------
    const newRefunded = order.refundedAmount + amount;

    // -----------------------------
    // Determine new payment status
    // -----------------------------
    const newStatus =
      newRefunded >= order.total
        ? PaymentStatus.REFUNDED
        : PaymentStatus.PARTIAL_REFUND;

    // -----------------------------
    // Update order
    // -----------------------------
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        refundedAmount: newRefunded,
        paymentStatus: newStatus,
      },
    });

    // -----------------------------
    // Update related payments
    // -----------------------------
    await prisma.payment.updateMany({
      where: { orderId },
      data: { status: newStatus },
    });

    // -----------------------------
    // Audit log (timeline event)
    // -----------------------------
    await prisma.auditLog.create({
      data: {
        action: "ORDER_REFUND",
        actorType: "ADMIN",
        resource: "order",
        resourceId: orderId,
        message:
          newStatus === PaymentStatus.REFUNDED
            ? `Order fully refunded (₦${amount / 100})`
            : `Partial refund issued (₦${amount / 100})`,
        metadata: {
          amount,
          previousRefunded: order.refundedAmount,
          newRefunded,
          newStatus,
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (err) {
    console.error("Refund error:", err);

    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 }
    );
  }
}
