import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const orderId = req.nextUrl.searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { ok: false, message: "Missing orderId" },
        { status: 400 }
      );
    }

    /* ---------------------------------------------
     * Fetch order with items + payment
     * --------------------------------------------- */
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { ok: false, message: "Order not found" },
        { status: 404 }
      );
    }

    /* ---------------------------------------------
     * Normalize response
     * --------------------------------------------- */
    const response = {
      ok: true,
      orderId: order.id,
      temporary: order.temporary,
      orderStatus: order.orderStatus,
      total: order.total,
      createdAt: order.createdAt,
      confirmedAt: order.confirmedAt ?? null,
      items: order.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        attributes: i.attributes,
      })),
      payment: order.payment
        ? {
            status: order.payment.status,
            reference: order.payment.reference,
            paidAt: order.payment.paidAt,
          }
        : null,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("Order status error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
