import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmInventory } from "@/lib/inventory/confirm";

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

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
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { ok: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (!order.temporary) {
      return NextResponse.json(
        { ok: false, message: "Order already confirmed" },
        { status: 409 }
      );
    }

    /* ---------------------------------------------
     * Confirm inventory
     * --------------------------------------------- */
    try {
      await confirmInventory(orderId);
    } catch (err) {
      console.error("Inventory confirmation failed:", err);
      return NextResponse.json(
        { ok: false, message: "Unable to confirm inventory" },
        { status: 409 }
      );
    }

    /* ---------------------------------------------
     * Finalize order inside a transaction
     * --------------------------------------------- */
    const updated = await prisma.$transaction(async (tx) => {
      // Double‑check inside transaction
      const fresh = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!fresh) throw new Error("Order disappeared");
      if (!fresh.temporary) return fresh; // Already confirmed

      return tx.order.update({
        where: { id: orderId },
        data: {
          temporary: false,
          orderStatus: "CONFIRMED",
          confirmedAt: new Date(),
        },
        include: { items: true },
      });
    });

    /* ---------------------------------------------
     * Analytics: count confirmed orders per product
     * --------------------------------------------- */
    await prisma.$transaction(
      updated.items.map((item) =>
        prisma.productInsights.upsert({
          where: { productId: item.productId },
          update: { confirmedOrderCount: { increment: 1 } },
          create: {
            productId: item.productId,
            confirmedOrderCount: 1,
          },
        })
      )
    );

    return NextResponse.json({
      ok: true,
      orderId,
      status: "CONFIRMED",
    });
  } catch (err) {
    console.error("Checkout confirm error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
