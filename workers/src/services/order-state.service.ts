export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "FAILED_DELIVERY"
  | "RETURNED"
  | "CANCELLED";

export type Actor = "SYSTEM" | "ADMIN" | "USER";

/**
 * Allowed transitions between states.
 * This is the authoritative state machine.
 */
export const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],

  PAID: ["CONFIRMED", "CANCELLED"],

  CONFIRMED: ["PROCESSING", "CANCELLED"],

  PROCESSING: ["SHIPPED", "CANCELLED"],

  SHIPPED: ["DELIVERED", "FAILED_DELIVERY"],

  FAILED_DELIVERY: ["PROCESSING", "RETURNED"],

  RETURNED: [],

  DELIVERED: [],

  CANCELLED: [],
};

/**
 * Validates whether an actor can transition an order
 * from one state to another.
 */
export function canTransition(
  current: OrderStatus,
  next: OrderStatus,
  actor: Actor
): boolean {
  // illegal transition
  if (!transitions[current]?.includes(next)) {
    return false;
  }

  // USER can only cancel
  if (actor === "USER" && next !== "CANCELLED") {
    return false;
  }

  // cannot cancel after shipping
  if (
    next === "CANCELLED" &&
    (current === "SHIPPED" || current === "DELIVERED")
  ) {
    return false;
  }

  return true;
}
