export type OrderStatus =
  | "CREATED"
  | "PENDING_PAYMENT"
  | "REVIEW"
  | "CONFIRMED"
  | "PACKING"
  | "SHIPPED"
  | "DELIVERED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "FAILED_DELIVERY"
  | "CANCELLED";


export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  CREATED: "Created",
  PENDING_PAYMENT: "Awaiting Payment",
  REVIEW: "Under Review",
  CONFIRMED: "Confirmed",
  PACKING: "Packing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  RETURN_REQUESTED: "Return Requested",
  RETURNED: "Returned",
  FAILED_DELIVERY: "Delivery Failed",
  CANCELLED: "Cancelled",
};


export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  CREATED: "bg-surface-muted text-text-secondary",
  PENDING_PAYMENT: "bg-warning/15 text-warning",
  REVIEW: "bg-orange-500/15 text-orange-500",
  CONFIRMED: "bg-primary/15 text-primary",
  PACKING: "bg-blue-500/15 text-blue-500",
  SHIPPED: "bg-info/15 text-info",
  DELIVERED: "bg-success/15 text-success",
  RETURN_REQUESTED: "bg-purple-500/15 text-purple-500",
  RETURNED: "bg-purple-700/15 text-purple-700",
  FAILED_DELIVERY: "bg-danger/15 text-danger",
  CANCELLED: "bg-danger/15 text-danger",
};


// Allowed transitions
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CREATED: ["PENDING_PAYMENT", "CANCELLED"],

  PENDING_PAYMENT: ["REVIEW", "CONFIRMED", "CANCELLED"],

  REVIEW: ["CONFIRMED", "CANCELLED"],

  CONFIRMED: ["PACKING", "CANCELLED"],

  PACKING: ["SHIPPED", "CANCELLED"],

  SHIPPED: ["DELIVERED", "FAILED_DELIVERY"],

  FAILED_DELIVERY: ["SHIPPED", "CANCELLED"],

  DELIVERED: ["RETURN_REQUESTED"],

  RETURN_REQUESTED: ["RETURNED"],

  RETURNED: [],

  CANCELLED: [],
};

export function getNextStatuses(current: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[current] || [];
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}
