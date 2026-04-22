// app/api/cart/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/auth/session";
import { logAuditEvent } from "@/lib/audit/log";

export async function POST(req: NextRequest) {
  try {
    const user = await requireSessionUser();
    const { items } = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    // Validate items
    for (const item of items) {
      if (!item.productId || !item.variantId || !item.name || typeof item.quantity !== 'number') {
        return NextResponse.json({ error: "Invalid item format" }, { status: 400 });
      }
    }

    // Upsert cart
    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      update: {
        items: {
          deleteMany: {}, // Clear existing items
          create: items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            image: item.image,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            attributes: item.attributes || {},
          })),
        },
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            image: item.image,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            attributes: item.attributes || {},
          })),
        },
      },
      include: {
        items: true,
      },
    });

    await logAuditEvent({
      action: "CART_SYNCED",
      actorType: "USER",
      actorId: user.id,
      resource: "cart",
      resourceId: cart.id,
      metadata: { itemCount: items.length },
    });

    return NextResponse.json({ success: true, cart });

  } catch (error) {
    console.error("Cart sync error:", error);
    return NextResponse.json({ error: "Failed to sync cart" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireSessionUser();

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [] });
    }

    // Convert to client format
    const items = cart.items.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      unitPrice: item.unitPrice,
      image: item.image,
      quantity: item.quantity,
      attributes: item.attributes,
    }));

    return NextResponse.json({ items });

  } catch (error) {
    console.error("Cart fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}