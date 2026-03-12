// PATH: lib/orders/confirm-payment.ts
// NAME: confirm-payment.ts

"use server";

import { prisma } from "@/lib/db";
import { ApiError, handleError } from "@/lib/errors";
import { notifyOrderReceipt } from "@/lib/notifications/dispatchers/order";
import { notifyPaymentConfirmed } from "@/lib/notifications/dispatchers/payment";

export async function confirmPayment(orderId: string) {
  try {
    if (!orderId) {
      throw ApiError.badRequest("Order ID is required");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw ApiError.notFound("Order not found");
    }

    if (order.paymentStatus === "PAID") {
      throw ApiError.conflict("Payment already confirmed");
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        orderStatus: "PROCESSING",
      },
      include: { items: true },
    });

    await notifyOrderReceipt({
      id: updated.id,
      email: updated.email,
      phone: updated.phone ?? undefined,
      items: updated.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      subtotal: updated.subtotal,
    });

    await notifyPaymentConfirmed({
      id: updated.id,
      email: updated.email,
      phone: updated.phone ?? undefined,
      total: updated.total,
    });

    return updated.id;
  } catch (error) {
    return handleError(error);
  }
}