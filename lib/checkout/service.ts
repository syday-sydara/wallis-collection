// lib/checkout/service.ts

import { prisma } from "@/lib/prisma";
import type { CheckoutPayload } from "./schema";
import { logEvent } from "@/lib/auth/logger";

/**
 * Secure checkout processor
 * - Validates cart items
 * - Validates stock atomically
 * - Prevents price tampering
 * - Computes totals securely
 * - Creates order + order items
 * - Logs audit + fraud signals
 */
export async function processCheckout(payload: CheckoutPayload) {
  const variantIds = payload.items.map((i) => i.variantId);

  return prisma.$transaction(async (tx) => {
    /* -------------------------------------------------- */
    /* Fetch variants                                      */
    /* -------------------------------------------------- */
    const variants = await tx.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    if (variants.length !== payload.items.length) {
      throw new Error("Some items in your cart are no longer available");
    }

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    /* -------------------------------------------------- */
    /* Validate each item                                  */
    /* -------------------------------------------------- */
    for (const item of payload.items) {
      const variant = variantMap.get(item.variantId);
      if (!variant) {
        throw new Error("A product variant no longer exists");
      }

      // Stock check
      if (item.quantity > variant.stock) {
        throw new Error(`Insufficient stock for ${variant.name}`);
      }

      // Price integrity check
      if (item.price !== variant.price) {
        throw new Error(
          `Price changed for ${variant.name}. Refresh your cart.`
        );
      }
    }

    /* -------------------------------------------------- */
    /* Compute totals securely                             */
    /* -------------------------------------------------- */
    const subtotal = payload.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const shippingCost =
      payload.shippingType === "EXPRESS" ? 2500 : 1500;

    const total = subtotal + shippingCost;

    /* -------------------------------------------------- */
    /* Create address record                               */
    /* -------------------------------------------------- */
    const address = await tx.address.create({
      data: {
        fullName: payload.fullName,
        phone: payload.phone,
        line1: payload.address,
        city: payload.city,
        state: payload.state,
        country: "Nigeria",
      },
    });

    /* -------------------------------------------------- */
    /* Reserve stock atomically                            */
    /* -------------------------------------------------- */
    for (const item of payload.items) {
      const updated = await tx.productVariant.update({
        where: {
          id: item.variantId,
          // Prevent race conditions: ensure stock is still enough
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      if (!updated) {
        throw new Error(
          `Stock changed for ${item.name}. Please refresh your cart.`
        );
      }
    }

    /* -------------------------------------------------- */
    /* Create order + items                                */
    /* -------------------------------------------------- */
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

        // Safe cart snapshot (prevents tampering)
        cartSnapshot: payload.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          name: i.name,
          image: i.image,
          quantity: i.quantity,
          price: i.price,
        })),

        items: {
          create: payload.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    /* -------------------------------------------------- */
    /* Audit logging                                        */
    /* -------------------------------------------------- */
    logEvent("checkout_order_created", {
      orderId: order.id,
      email: payload.email,
      itemsCount: payload.items.length,
      total,
    });

    /* -------------------------------------------------- */
    /* Return response                                      */
    /* -------------------------------------------------- */
    return {
      orderId: order.id,
      paymentUrl: null, // Payment integration can be added here
    };
  });
}
