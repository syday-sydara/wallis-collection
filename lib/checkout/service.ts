// lib/checkout/service.ts
import { prisma } from "@/lib/db";
import type { CheckoutPayload } from "./schema";
import { logSecurityEvent } from "@/lib/security/events";
import { getSessionUser } from "@/lib/auth/session";
import { createPaystackSession } from "../payment/paystack";
import { createMonnifySession } from "@/lib/payment/monnify";

type CheckoutResult = {
  orderId: string;
  paymentUrl: string | null;
};

async function createPaymentSession(payload: CheckoutPayload & { orderId: string }) {
  if (payload.paymentMethod === "PAYSTACK") {
    return createPaystackSession({
      email: payload.email,
      amount: payload.items.reduce((sum, i) => sum + i.quantity * 1, 0), // replaced by real total
      orderId: payload.orderId
    });
  }

  if (payload.paymentMethod === "MONNIFY") {
    return createMonnifySession({
      email: payload.email,
      amount: payload.items.reduce((sum, i) => sum + i.quantity * 1, 0),
      orderId: payload.orderId
    });
  }

  return null;
}


export async function processCheckout(
  payload: CheckoutPayload
): Promise<CheckoutResult> {
  const user = await getSessionUser();

  return await prisma.$transaction(async (tx) => {
    // 1. Load products
    const productIds = payload.items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, deletedAt: null },
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

    // 2. Validate stock + compute total
    let total = 0;
    const orderItemsData = payload.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error("Product not found");

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const lineTotal = product.basePrice * item.quantity;
      total += lineTotal;

      return {
        name: product.name,
        image: product.images[0]?.url ?? null,
        variants: {}, // extend later
        quantity: item.quantity,
        price: product.basePrice,
        productId: product.id
      };
    });

    // 3. Create order
    const order = await tx.order.create({
      data: {
        email: payload.email,
        phone: payload.phone,
        fullName: payload.fullName,
        paymentMethod: payload.paymentMethod,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        shippingType: payload.shippingType,
        address: payload.address,
        city: payload.city,
        state: payload.state,
        total,
        cartSnapshot: payload.items,
        userId: user?.id ?? null,
        items: {
          create: orderItemsData
        }
      }
    });

    // 4. Deduct stock + log inventory movements
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

    // 5. Create payment session
    const paymentUrl = await createPaymentSession({
      ...payload,
      orderId: order.id
    });

    // 6. Log security event
    await logSecurityEvent({
      userId: user?.id,
      type: "CHECKOUT_CREATED",
      message: `Checkout created for order ${order.id} with total ${total}`
    });

    return {
      orderId: order.id,
      paymentUrl
    };
  });
}
