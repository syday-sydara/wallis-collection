// app/api/orders/lookup/route.ts
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { orderId, userId } = await req.json();

    if (!orderId && !userId) {
      return Response.json(
        { error: "Provide either orderId or userId" },
        { status: 400 }
      );
    }

    // Lookup by orderId
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        return Response.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      return Response.json(order);
    }

    // Lookup by userId (return latest order)
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 1,
    });

    if (orders.length === 0) {
      return Response.json(
        { error: "No orders found for this user" },
        { status: 404 }
      );
    }

    return Response.json(orders[0]);
  } catch (error) {
    console.error("Order lookup error:", error);
    return Response.json(
      { error: "Failed to lookup order" },
      { status: 500 }
    );
  }
}