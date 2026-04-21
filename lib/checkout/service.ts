// lib/checkout/service.ts

import { prisma } from "@/lib/prisma";
import type { CheckoutPayload } from "./schema";
import { logEvent } from "@/lib/auth/logger";

import { evaluateRisk } from "@/lib/risk/rules/service";
import { buildRiskContext } from "@/lib/risk/context";

export async function processCheckout(
  payload: CheckoutPayload,
  meta: { ip: string; userAgent: string; userId?: string | null }
) {
  const variantIds = payload.items.map((i) => i.variantId);

  /* -------------------------------------------------- */
  /* 1. Compute totals BEFORE risk evaluation            */
  /* -------------------------------------------------- */
  const subtotal = payload.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const shippingCost =
    payload.shippingType === "EXPRESS" ? 2500 : 1500;

  const total = subtotal + shippingCost;

  /* -------------------------------------------------- */
  /* 2. Build risk context                               */
  /* -------------------------------------------------- */
  const riskContext = buildRiskContext({
    ip: meta.ip,
    email: payload.email,
    phone: payload.phone,
    userAgent: meta.userAgent,
    userId: meta.userId ?? null,

    // Transaction
    amount: total,

    // Geo
    country: "Nigeria",
    city: payload.city,
    region: null,
    distanceFromLastIpKm: null,

    // Device (placeholder)
    deviceId: null,
    deviceReputation: 100,
    deviceConfidence: 100,
  });

  /* -------------------------------------------------- */
  /* 3. Evaluate risk policy                             */
  /* -------------------------------------------------- */
  const risk = await evaluateRisk({
    policyId: "default",
    ...riskContext,
  });

  const riskLevel = risk.block
    ? "HIGH"
    : risk.review
    ? "MEDIUM"
    : "LOW";

  if (risk.block) {
    throw new Error(
      "Your order could not be completed due to a security check. Please contact support."
    );
  }

  if (risk.review) {
    logEvent("checkout_risk_review", {
      email: payload.email,
      score: risk.score,
      triggeredRules: risk.triggeredRules,
    });
  }

  /* -------------------------------------------------- */
  /* 4. Continue with normal checkout flow               */
  /* -------------------------------------------------- */
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
      if (!variant) throw new Error("A product variant no longer exists");

      if (item.quantity > variant.stock) {
        throw new Error(`Insufficient stock for ${variant.product.name}`);
      }

      if (item.price !== variant.price) {
        throw new Error(
          `Price changed for ${variant.product.name}. Refresh your cart.`
        );
      }
    }

    /* -------------------------------------------------- */
    /* Create shipping address                             */
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
      const updated = await tx.productVariant.updateMany({
        where: {
          id: item.variantId,
          stock: { gte: item.quantity },
        },
        data: {
          stock: { decrement: item.quantity },
        },
      });

      if (updated.count === 0) {
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

        subtotal,
        shippingCost,
        total,

        currency: "NGN",
        paymentMethod: payload.paymentMethod,
        paymentStatus: "PENDING",
        orderStatus: risk.review ? "REVIEW" : "CREATED",

        shippingType: payload.shippingType,
        shippingAddress: {
          fullName: payload.fullName,
          phone: payload.phone,
          line1: payload.address,
          city: payload.city,
          state: payload.state,
          country: "Nigeria",
        },

        // ⭐ Risk Engine fields
        riskScore: risk.score,
        riskTriggeredRules: risk.triggeredRules,
        riskLevel,
        riskContextSnapshot: riskContext,

        cartSnapshot: payload.items,

        addressId: address.id,

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
      total,
      riskScore: risk.score,
      riskLevel,
    });

    return {
      orderId: order.id,
      paymentUrl: null,
    };
  });
}
