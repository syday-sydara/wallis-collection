// lib/checkout/service.ts
import { prisma } from "@/lib/db";
import type { CheckoutPayload } from "./schema";
import { logSecurityEvent } from "@/lib/security/events";
import { getSessionUser } from "@/lib/auth/session";
import { getShippingCost } from "./shipping";
import { createPaystackSession } from "@/lib/payments/paystack";
import { createMonnifySession } from "@/lib/payments/monnify";

type CheckoutResult = {
  orderId: string;
  paymentUrl: string | null;
};

export async function processCheckout(
  payload: CheckoutPayload
): Promise<CheckoutResult> {
  const user = await getSessionUser();

  const { order, totalKobo } = await prisma.$transaction(async (tx) => {
    const productIds = payload.items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, deletedAt: null, isArchived: false },
      select: {
        id: true,
        name: true,
        basePrice: true,
        stock: true,
        images: { take: 1, select: { url: true } }
      }
    });

    if (products.length !== productIds.length) {
      throw new Error("Some products are unavailable");
    }

    let itemsTotal = 0;
    const orderItemsData = payload.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error("Product not found");

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const lineTotal = product.basePrice * item.quantity;
      itemsTotal += lineTotal;

      return {
        name: product.name,
        image: product.images[0]?.url ?? null,
        variants: {},
        quantity: item.quantity,
        price: product.basePrice,
        productId: product.id
      };
    });

    const shippingCost = getShippingCost(payload.state);
    const totalKobo = itemsTotal + shippingCost;

    const existing = await tx.order.findFirst({
      where: {
        email: payload.email,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        cartSnapshot: payload.items
      }
    });

    const order =
      existing ??
      (await tx.order.create({
        data: {
          email: payload.email,
          phone: payload.phone,
          fullName: payload.fullName,
          paymentMethod: payload.paymentMethod,
          paymentStatus: "PENDING",
          orderStatus: "PENDING",
          shippingType: payload.shippingType,
          shippingState: payload.state,
          shippingCost,
          address: payload.address,
          city: payload.city,
          state: payload.state,
          total: totalKobo,
          cartSnapshot: payload.items,
          userId: user?.id ?? null,
          items: {
            create: orderItemsData
          }
        }
      }));

    for (const item of payload.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          inventory: {
            create: {
              change: -item.quantity,
              reason: "CHECKOUT",
              reference: order.id
            }
          }
        }
      });
    }

    return { order, totalKobo };
  });

  let paymentUrl: string | null = null;

  if (order.paymentMethod === "PAYSTACK") {
    paymentUrl = await createPaystackSession({
      email: order.email,
      amountKobo: totalKobo,
      orderId: order.id
    });
  } else if (order.paymentMethod === "MONNIFY") {
    paymentUrl = await createMonnifySession({
      email: order.email,
      amount: totalKobo / 100,
      orderId: order.id
    });
  }

  await logSecurityEvent({
    userId: user?.id,
    type: "CHECKOUT_CREATED",
    message: `Checkout created for order ${order.id} with total ${totalKobo}`
  });

  return {
    orderId: order.id,
    paymentUrl
  };
}
