// PATH: lib/orders/create-order.ts
"use server";

import { prisma } from "@/lib/db";
import { ApiError, handleError } from "@/lib/api/response";
import { decreaseVariantStock } from "@/lib/orders/inventory";
import { notifyOrderReceipt } from "@/lib/notifications/dispatchers/order";
import { formatKobo } from "@/lib/formatters";

export async function createOrder(data: {
  email: string;
  phone?: string;

  shippingType: "DELIVERY" | "PICKUP";
  address?: string;
  city?: string;
  state?: string;
  landmark?: string;

  paymentMethod: "PAYSTACK" | "MONNIFY" | "BANK_TRANSFER" | "COD";

  items: {
    productId: string;
    variantId: string;
    name: string;
    variantLabel?: string; // e.g., "Size M"
    priceKobo: number;
    quantity: number;
    image?: string | null;
  }[];
}) {
  try {
    if (!data.email) throw ApiError.badRequest("Email is required");
    if (!data.items?.length) throw ApiError.badRequest("Order must contain at least one item");

    /* ------------------------------------------------------------
       1. Recalculate subtotal server-side (never trust client)
    ------------------------------------------------------------- */
    const subtotal = data.items.reduce(
      (sum, item) => sum + item.priceKobo * item.quantity,
      0
    );

    const total = subtotal; // Add shipping fee later if needed

    /* ------------------------------------------------------------
       2. Create order + items
    ------------------------------------------------------------- */
    const order = await prisma.order.create({
      data: {
        email: data.email,
        phone: data.phone,

        shippingType: data.shippingType,
        address: data.address,
        city: data.city,
        state: data.state,
        landmark: data.landmark,

        paymentMethod: data.paymentMethod,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",

        total,
        currency: "NGN",

        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.name,
            variantLabel: item.variantLabel,
            productImage: item.image ?? undefined,
            price: item.priceKobo,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    /* ------------------------------------------------------------
       3. Decrease stock for each variant
    ------------------------------------------------------------- */
    for (const item of order.items) {
      await decreaseVariantStock(item.variantId!, item.quantity, "SALE", order.id);
    }

    /* ------------------------------------------------------------
       4. Send order receipt notification
    ------------------------------------------------------------- */
    await notifyOrderReceipt({
      id: order.id,
      email: order.email,
      phone: order.phone ?? undefined,
      items: order.items.map((i) => ({
        name: i.productName,
        variant: i.variantLabel,
        quantity: i.quantity,
        price: formatKobo(i.price),
      })),
      subtotal: formatKobo(order.total),
    });

    return order.id;
  } catch (error) {
    return handleError(error);
  }
}
