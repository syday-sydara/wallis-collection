export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  SUCCESS: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: "bg-warning/15 text-warning",
  SUCCESS: "bg-success/15 text-success",
  FAILED: "bg-danger/15 text-danger",
  REFUNDED: "bg-info/15 text-info",
};

// Allowed transitions
export const PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  PENDING: ["SUCCESS", "FAILED"],
  SUCCESS: ["REFUNDED"],
  FAILED: [],
  REFUNDED: [],
};

export function getNextPaymentStatuses(
  current: PaymentStatus
): PaymentStatus[] {
  return PAYMENT_STATUS_TRANSITIONS[current] || [];
}
