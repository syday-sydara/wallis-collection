import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reserveInventory } from "@/lib/inventory/reserve";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const { items, phone } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { ok: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    /* ---------------------------------------------
     * Normalize WhatsApp phone number
     * --------------------------------------------- */
    const businessPhone = String(phone || "2348000000001")
      .replace(/\D/g, "")
      .replace(/^0+/, "");

    /* ---------------------------------------------
     * Validate + compute totals
     * --------------------------------------------- */
    let subtotal = 0;

    const orderItems = items.map((item: any) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      const lineTotal = qty * price;

      subtotal += lineTotal;

      return {
        productId: item.productId,
        name: item.name,
        quantity: qty,
        unitPrice: price,
        attributes: item.attributes ?? null,
      };
    });

    /* ---------------------------------------------
     * Create temporary order
     * --------------------------------------------- */
    const orderId = nanoid();

    const order = await prisma.order.create({
      data: {
        id: orderId,
        orderStatus: "PENDING",
        total: subtotal,
        temporary: true,
        items: {
          create: orderItems.map((i) => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            attributes: i.attributes,
          })),
        },
      },
      include: { items: true },
    });

    /* ---------------------------------------------
     * Reserve inventory
     * --------------------------------------------- */
    try {
      await reserveInventory(orderId);
    } catch (err) {
      console.error("Inventory reservation failed:", err);

      // Cleanup order if reservation fails
      await prisma.order.delete({ where: { id: orderId } });

      return NextResponse.json(
        { ok: false, message: "Unable to reserve inventory" },
        { status: 409 }
      );
    }

    /* ---------------------------------------------
     * Track product insights (batched)
     * --------------------------------------------- */
    await prisma.$transaction(
      order.items.map((item) =>
        prisma.productInsights.upsert({
          where: { productId: item.productId },
          update: { whatsappClickCount: { increment: 1 } },
          create: {
            productId: item.productId,
            whatsappClickCount: 1,
          },
        })
      )
    );

    /* ---------------------------------------------
     * Build WhatsApp message
     * --------------------------------------------- */
    const lines: string[] = ["Hello! I want to place an order:", ""];

    for (const item of order.items) {
      const variantLabel = item.attributes
        ? Object.values(item.attributes).join(" / ")
        : null;

      const label = variantLabel
        ? `${item.name} (${variantLabel})`
        : item.name;

      const lineTotal = item.unitPrice * item.quantity;

      lines.push(`${label} x${item.quantity} = ₦${lineTotal.toLocaleString("en-NG")}`);
    }

    lines.push("");
    lines.push(`Subtotal: ₦${subtotal.toLocaleString("en-NG")}`);
    lines.push("");
    lines.push(`Order ID: ${orderId}`);
    lines.push("");
    lines.push("Delivery location:");
    lines.push("Payment method:");

    const message = encodeURIComponent(lines.join("\n"));

    const whatsappUrl = `https://wa.me/${businessPhone}?text=${message}`;

    return NextResponse.json({
      ok: true,
      url: whatsappUrl,
      orderId,
    });
  } catch (err) {
    console.error("WhatsApp checkout error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
