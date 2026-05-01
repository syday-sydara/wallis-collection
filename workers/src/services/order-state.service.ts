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
 * Authoritative state machine.
 * Every state explicitly defines its allowed transitions.
 */
export const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  PENDING: ["PAID", "CANCELLED"],

  PAID: ["CONFIRMED", "CANCELLED"],

  CONFIRMED: ["PROCESSING", "CANCELLED"],

  PROCESSING: ["SHIPPED", "CANCELLED"],

  SHIPPED: ["DELIVERED", "FAILED_DELIVERY"],

  FAILED_DELIVERY: ["PROCESSING", "RETURNED"],

  RETURNED: [],

  DELIVERED: [],

  CANCELLED: [],
} as const;

/**
 * Validates whether an actor can transition an order
 * from one state to another.
 */
export function canTransition(
  current: OrderStatus,
  next: OrderStatus,
  actor: Actor
): boolean {
  // 1. Illegal transition based on the state machine
  if (!transitions[current].includes(next)) {
    return false;
  }

  // 2. USER can only cancel
  if (actor === "USER" && next !== "CANCELLED") {
    return false;
  }

  // 3. Cannot cancel after shipping or delivery
  if (
    next === "CANCELLED" &&
    (current === "SHIPPED" || current === "DELIVERED")
  ) {
    return false;
  }

  return true;
}
