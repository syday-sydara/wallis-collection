"use server";

import { prisma } from "@/lib/db";

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

  subtotal: number; // in naira
}) {
  // Future: shipping fee, tax, discounts
  const total = data.subtotal;

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
  });

  return order.id;
}
