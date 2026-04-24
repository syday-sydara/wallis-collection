import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmInventory } from "@/lib/inventory/confirm";
import { releaseInventory } from "@/lib/inventory/release";

export async function POST(req: NextRequest) {
  try {
    const { orderId, status, paymentStatus, note } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { ok: false, message: "Missing orderId" },
        { status: 400 }
      );
    }

    /* ---------------------------------------------
     * Fetch order
     * --------------------------------------------- */
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payment: true },
    });

    if (!order) {
      return NextResponse.json(
        { ok: false, message: "Order not found" },
        { status: 404 }
      );
    }

    /* ---------------------------------------------
     * Validate status transitions
     * --------------------------------------------- */
    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "FAILED"];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { ok: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    /* ---------------------------------------------
     * Handle inventory transitions
     * --------------------------------------------- */

    // CONFIRM ORDER → confirm inventory
    if (status === "CONFIRMED" && order.orderStatus !== "CONFIRMED") {
      try {
        await confirmInventory(orderId);
      } catch (err) {
        console.error("Inventory confirmation failed:", err);
        return NextResponse.json(
          { ok: false, message: "Unable to confirm inventory" },
          { status: 409 }
        );
      }
    }

    // CANCEL ORDER → release inventory
    if (status === "CANCELLED" && order.orderStatus !== "CANCELLED") {
      try {
        await releaseInventory(orderId);
      } catch (err) {
        console.error("Inventory release failed:", err);
        return NextResponse.json(
          { ok: false, message: "Unable to release inventory" },
          { status: 409 }
        );
      }
    }

    /* ---------------------------------------------
     * Update order + payment inside a transaction
     * --------------------------------------------- */
    const updated = await prisma.$transaction(async (tx) => {
      const updates: any = {};

      if (status) {
        updates.orderStatus = status;

        if (status === "CONFIRMED") {
          updates.confirmedAt = new Date();
          updates.temporary = false;
        }
      }

      if (note) {
        updates.adminNote = note;
      }

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: updates,
        include: { items: true, payment: true },
      });

      // Update payment status if provided
      if (paymentStatus && updatedOrder.payment) {
        await tx.payment.update({
          where: { id: updatedOrder.payment.id },
          data: { status: paymentStatus },
        });
      }

      return updatedOrder;
    });

    return NextResponse.json({
      ok: true,
      order: updated,
    });
  } catch (err) {
    console.error("Order update error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
