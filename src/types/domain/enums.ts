// -----------------------------
// Payment Status
// -----------------------------
export enum PaymentStatus {
  Pending = "pending",
  Verified = "verified",
  Failed = "failed",
}

export type PaymentStatusType = `${PaymentStatus}`;

export const PaymentStatusLabel: Record<PaymentStatus, string> = {
  [PaymentStatus.Pending]: "Pending",
  [PaymentStatus.Verified]: "Verified",
  [PaymentStatus.Failed]: "Failed",
};

export const PaymentStatusColor: Record<PaymentStatus, string> = {
  [PaymentStatus.Pending]: "yellow",
  [PaymentStatus.Verified]: "green",
  [PaymentStatus.Failed]: "red",
};


// -----------------------------
// Order Status
// -----------------------------
export enum OrderStatus {
  Pending = "pending",
  Processing = "processing",
  Completed = "completed",
  Cancelled = "cancelled",
}

export type OrderStatusType = `${OrderStatus}`;

export const OrderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: "Pending",
  [OrderStatus.Processing]: "Processing",
  [OrderStatus.Completed]: "Completed",
  [OrderStatus.Cancelled]: "Cancelled",
};

export const OrderStatusColor: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: "yellow",
  [OrderStatus.Processing]: "blue",
  [OrderStatus.Completed]: "green",
  [OrderStatus.Cancelled]: "red",
};


// -----------------------------
// Order Status Transitions
// -----------------------------
export const OrderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.Pending]: [OrderStatus.Processing, OrderStatus.Cancelled],
  [OrderStatus.Processing]: [OrderStatus.Completed, OrderStatus.Cancelled],
  [OrderStatus.Completed]: [],
  [OrderStatus.Cancelled]: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return OrderStatusTransitions[from].includes(to);
}


// -----------------------------
// Status Groups (Analytics)
// -----------------------------
export const CompletedStatuses = [OrderStatus.Completed];
export const ActiveStatuses = [OrderStatus.Pending, OrderStatus.Processing];
export const FailedStatuses = [OrderStatus.Cancelled];
