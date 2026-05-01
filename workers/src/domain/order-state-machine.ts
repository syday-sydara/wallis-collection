export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "FAILED_DELIVERY"
  | "RETURNED"
  | "CANCELLED";

export type Actor = "SYSTEM" | "ADMIN" | "USER";

const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "FAILED_DELIVERY"],
  FAILED_DELIVERY: ["PROCESSING", "RETURNED"],
  RETURNED: [],
  DELIVERED: [],
  CANCELLED: [],
};

export function canTransition(
  current: OrderStatus,
  next: OrderStatus,
  actor: Actor
): boolean {
  if (!transitions[current]?.includes(next)) return false;

  // user restrictions
  if (actor === "USER" && next !== "CANCELLED") return false;

  // cancellation guard
  if (
    next === "CANCELLED" &&
    ["SHIPPED", "DELIVERED"].includes(current)
  ) {
    return false;
  }

  return true;
}