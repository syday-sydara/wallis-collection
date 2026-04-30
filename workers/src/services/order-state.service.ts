import { prisma } from "../prisma/client";
import { OrderStatus } from "@prisma/client";
import { canTransition } from "../domain/order-state-machine";

export class OrderStateService {
  static async transition(orderId: string, next: OrderStatus) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");

    const current = order.status as OrderStatus;

    if (!canTransition(current, next)) {
      throw new Error(`Invalid transition: ${current} → ${next}`);
    }

    return prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: next },
      });

      await tx.orderStatusHistory.create({
        data: { orderId, from: current, to: next },
      });

      return next;
    });
  }
}
