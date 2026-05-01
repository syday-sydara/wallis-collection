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
  PROCESSING: ["SHIPPED", "FAILED_DELIVERY", "CANCELLED"],
  SHIPPED: ["DELIVERED", "FAILED_DELIVERY"],
  FAILED_DELIVERY: ["PROCESSING", "RETURNED", "CANCELLED"],
  RETURNED: ["CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};


export function canTransition(
  current: OrderStatus,
  next: OrderStatus,
  actor: Actor
): boolean {
  // 1. Terminal states cannot transition
  if (["DELIVERED", "RETURNED", "CANCELLED"].includes(current)) {
    return false;
  }

  // 2. Transition must be allowed by the state machine
  if (!transitions[current]?.includes(next)) {
    return false;
  }

  // 3. USER restrictions — users can only cancel early
  if (actor === "USER") {
    if (next !== "CANCELLED") return false;

    if (["SHIPPED", "DELIVERED", "RETURNED"].includes(current)) {
      return false;
    }
  }

  // 4. ADMIN/SYSTEM cannot cancel delivered or returned orders
  // (FAILED_DELIVERY cancellation is allowed)
  if (
    actor !== "USER" &&
    next === "CANCELLED" &&
    ["DELIVERED", "RETURNED"].includes(current)
  ) {
    return false;
  }

  return true;
}


