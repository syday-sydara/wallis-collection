import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { handleError, handleSuccess, ApiError } from "@/lib/errors";
import { verifyPaystackPayment } from "@/lib/paystack";
import { verifyMonnifyPayment } from "@/lib/monnify";
import { decreaseStock } from "@/lib/inventory";

export async function POST(req: Request) {
  try {
    const { reference, provider } = await req.json();

    if (!reference || !provider) {
      throw ApiError.badRequest("Missing payment reference or provider");
    }

    // 1️⃣ Fetch order with items
    const order = await prisma.order.findUnique({
      where: { id: reference },
      include: { items: true },
    });

    if (!order) {
      throw ApiError.notFound("Order not found");
    }

    if (order.paymentStatus === "PAID") {
      return handleSuccess({ message: "Payment already verified", order });
    }

    let verified = null;

    // 2️⃣ Verify with Paystack
    if (provider === "paystack") {
      verified = await verifyPaystackPayment(reference);

      if (verified.status !== "success") {
        throw ApiError.badRequest("Payment not successful");
      }
    }

    // 3️⃣ Verify with Monnify
    if (provider === "monnify") {
      verified = await verifyMonnifyPayment(reference);

      if (verified.paymentStatus !== "PAID") {
        throw ApiError.badRequest("Payment not successful");
      }
    }

    // 4️⃣ Deduct inventory for each item
    for (const item of order.items) {
      await decreaseStock(
        item.productId,
        item.quantity,
        "SALE",
        order.id
      );
    }

    // 5️⃣ Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: reference },
      data: {
        paymentStatus: "PAID",
        orderStatus: "PROCESSING",
      },
      include: { items: true },
    });

    return handleSuccess({
      message: "Payment verified and inventory updated",
      order: updatedOrder,
    });
  } catch (error) {
    return handleError(error);
  }
}
