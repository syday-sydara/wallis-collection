// PATH: lib/orders/confirm-payment.ts
"use server";

import { prisma } from "@/lib/db";
import { ApiError, handleError } from "@/lib/api/response";
import { notifyOrderReceipt } from "@/lib/notifications/dispatchers/order";
import { notifyPaymentConfirmed } from "@/lib/notifications/dispatchers/payment";
import { PaymentStatus, OrderStatus } from "@prisma/client";
import { formatKobo } from "@/lib/formatters";

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

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw ApiError.conflict("Payment already confirmed");
    }

    // Update order status
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        orderStatus: OrderStatus.PROCESSING,
      },
      include: { items: true },
    });

    // Send order receipt (optional)
    await notifyOrderReceipt({
      id: updated.id,
      email: updated.email,
      phone: updated.phone ?? undefined,
      items: updated.items.map((i) => ({
        name: i.productName,
        variant: i.variantLabel,
        quantity: i.quantity,
        price: formatKobo(i.price),
      })),
      total: formatKobo(updated.total),
    });

    // Send payment confirmation
    await notifyPaymentConfirmed({
      id: updated.id,
      email: updated.email,
      phone: updated.phone ?? undefined,
      total: formatKobo(updated.total),
    });

    return updated.id;
  } catch (error) {
    return handleError(error);
  }
}
