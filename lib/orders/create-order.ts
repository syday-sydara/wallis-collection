// PATH: lib/orders/create-order.ts
"use server";

import { prisma } from "@/lib/db";
import { ApiError, handleError } from "@/lib/errors";
import { decreaseStock } from "@/lib/inventory";
import { notifyOrderReceipt } from "@/lib/notifications/dispatchers/order";

export async function createOrder(data: {
  email: string;
  phone?: string;

  shippingType: "DELIVERY" | "PICKUP";
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  courierPhone?: string;
  trackingNumber?: string;

  paymentMethod: "CARD" | "BANK_TRANSFER" | "PAY_ON_DELIVERY";

  items: {
    id: string;
    name: string;
    priceCents: number;
    quantity: number;
    image: string | null;
  }[];

  subtotal: number;
}) {
  try {
    if (!data.email) {
      throw ApiError.badRequest("Email is required");
    }

    if (!data.items?.length) {
      throw ApiError.badRequest("Order must contain at least one item");
    }

    const total = data.subtotal;

    // 1. Create the order
    const order = await prisma.order.create({
      data: {
        email: data.email,
        phone: data.phone,

        shippingType: data.shippingType,
        address: data.address,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        courierPhone: data.courierPhone,
        trackingNumber: data.trackingNumber,

        paymentMethod: data.paymentMethod,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",

        subtotal: data.subtotal,
        total,

        items: {
          create: data.items.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.priceCents,
            quantity: item.quantity,
            image: item.image ?? undefined,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // 2. Decrease stock for each item
    for (const item of order.items) {
      await decreaseStock(item.productId, item.quantity, "SALE", order.id);
    }

    // 3. Send order receipt notifications
    await notifyOrderReceipt({
      id: order.id,
      email: order.email,
      phone: order.phone ?? undefined,
      items: order.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      subtotal: order.subtotal,
    });

    return order.id;
  } catch (error) {
    return handleError(error);
  }
}