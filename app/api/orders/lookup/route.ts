import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/* ---------------- GET: List Orders ---------------- */
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: { product: true },
        },
        shipments: true,
      },
    });

    return NextResponse.json(orders);
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

/* ---------------- POST: Create Order (COD) ---------------- */
export async function POST(req: Request) {
  try {
    const { email, phone, items } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const total = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        email,
        phone,
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        orderStatus: "PROCESSING",
        totalCents: total,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            priceCents: item.price,
          })),
        },
      },
    });

    return NextResponse.json(order);
  } catch (err) {
    console.error("Order creation failed:", err);
    return NextResponse.json({ error: "Order creation failed" }, { status: 500 });
  }
}
