// lib/payments/status.ts

export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"
  | "REVIEW"
  | "CHARGEBACK"
  | "EXPIRED"
  | "PARTIAL";

// Human‑readable labels
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  SUCCESS: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  REVIEW: "Under Review",
  CHARGEBACK: "Chargeback",
  EXPIRED: "Expired",
  PARTIAL: "Partially Paid",
};

// UI colors (Tailwind-friendly)
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: "bg-warning/15 text-warning",
  SUCCESS: "bg-success/15 text-success",
  FAILED: "bg-danger/15 text-danger",
  REFUNDED: "bg-info/15 text-info",
  REVIEW: "bg-orange-500/15 text-orange-500",
  CHARGEBACK: "bg-red-700/15 text-red-700",
  EXPIRED: "bg-gray-400/15 text-gray-500",
  PARTIAL: "bg-blue-500/15 text-blue-500",
};

// Allowed transitions (finite state machine)
export const PAYMENT_STATUS_TRANSITIONS: Record<
  PaymentStatus,
  PaymentStatus[]
> = {
  PENDING: ["SUCCESS", "FAILED", "EXPIRED", "PARTIAL", "REVIEW"],
  SUCCESS: ["REFUNDED", "CHARGEBACK"],
  FAILED: [],
  REFUNDED: [],
  REVIEW: ["SUCCESS", "FAILED"],
  CHARGEBACK: [],
  EXPIRED: [],
  PARTIAL: ["SUCCESS", "FAILED"],
};

// Helper: get allowed next statuses
export function getNextPaymentStatuses(
  current: PaymentStatus
): PaymentStatus[] {
  return PAYMENT_STATUS_TRANSITIONS[current] || [];
}

// Helper: check if a transition is allowed
export function canTransition(
  from: PaymentStatus,
  to: PaymentStatus
): boolean {
  return PAYMENT_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}
