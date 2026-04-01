// lib/checkout/service.ts

import { prisma } from "@/lib/db";
import type { CheckoutPayload } from "./schema";
import { logEvent } from "@/lib/logger";

/**
 * Lean checkout processor
 * - Validates cart items
 * - Validates stock
 * - Computes totals securely
 * - Creates order + order items
 */
export async function processCheckout(payload: CheckoutPayload) {
  const variantIds = payload.items.map(i => i.variantId);

  return prisma.$transaction(async (tx) => {
    const variants = await tx.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true }
    });

    if (variants.length !== payload.items.length) {
      throw new Error("Some items in your cart are no longer available");
    }

    const variantMap = new Map(variants.map(v => [v.id, v]));

    for (const item of payload.items) {
      const variant = variantMap.get(item.variantId);
      if (!variant) throw new Error("A product variant no longer exists");

      if (item.quantity > variant.stock) {
        throw new Error(`Insufficient stock for ${variant.name}`);
      }

      if (item.price !== variant.price) {
        throw new Error(`Price changed for ${variant.name}. Refresh your cart.`);
      }
    }

    const subtotal = payload.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const shippingCost = payload.shippingType === "EXPRESS" ? 2500 : 1500;
    const total = subtotal + shippingCost;

    // Create address record
    const address = await tx.address.create({
      data: {
        fullName: payload.fullName,
        phone: payload.phone,
        line1: payload.address,
        city: payload.city,
        state: payload.state,
        country: "Nigeria"
      }
    });

    // Reserve stock
    for (const item of payload.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    const order = await tx.order.create({
      data: {
        email: payload.email,
        phone: payload.phone,
        fullName: payload.fullName,
        paymentMethod: payload.paymentMethod,
        paymentStatus: "PENDING",
        orderStatus: "CREATED",
        shippingType: payload.shippingType,
        shippingCost,
        total,
        addressId: address.id,
        cartSnapshot: payload.items,
        items: {
          create: payload.items.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });

    logEvent("checkout_order_created", {
      orderId: order.id,
      email: payload.email,
      itemsCount: payload.items.length,
      total
    });

    return {
      orderId: order.id,
      paymentUrl: null
    };
  });
}
