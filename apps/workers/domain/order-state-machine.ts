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

const TERMINAL: OrderStatus[] = [
  "DELIVERED",
  "RETURNED",
  "CANCELLED",
];

const transitions: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "FAILED_DELIVERY", "CANCELLED"],
  SHIPPED: ["DELIVERED", "FAILED_DELIVERY"],
  FAILED_DELIVERY: ["PROCESSING", "RETURNED", "CANCELLED"],
  RETURNED: [],
  DELIVERED: [],
  CANCELLED: [],
} as const;

export function canTransition(
  current: OrderStatus,
  next: OrderStatus,
  actor: Actor
): boolean {
  // Normalize
  if (!current || !next) return false;

  // 1. Terminal states cannot transition
  if (TERMINAL.includes(current)) return false;

  // 2. No self-transitions
  if (current === next) return false;

  // 3. Transition must be allowed by the state machine
  if (!transitions[current]?.includes(next)) return false;

  // 4. USER restrictions — users can only cancel early
  if (actor === "USER") {
    if (next !== "CANCELLED") return false;
    if (["SHIPPED", "DELIVERED", "RETURNED"].includes(current)) return false;
  }

  // 5. ADMIN/SYSTEM cannot cancel delivered or returned orders
  if (
    actor !== "USER" &&
    next === "CANCELLED" &&
    ["DELIVERED", "RETURNED"].includes(current)
  ) {
    return false;
  }

  return true;
}
