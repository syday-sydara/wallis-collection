// === AUTO-GENERATED START ===

export const UserRole = ["USER", "ADMIN"] as const;
export type UserRole = (typeof UserRole)[number];

export const UserStatus = ["ACTIVE", "DISABLED", "BANNED"] as const;
export type UserStatus = (typeof UserStatus)[number];

export const PaymentStatus = [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
  "REVIEW",
  "CHARGEBACK",
  "EXPIRED",
  "PARTIAL",
] as const;
export type PaymentStatus = (typeof PaymentStatus)[number];

export const OrderStatus = [
  "CREATED",
  "PENDING_PAYMENT",
  "REVIEW",
  "CONFIRMED",
  "PACKING",
  "SHIPPED",
  "DELIVERED",
  "RETURN_REQUESTED",
  "RETURNED",
  "FAILED_DELIVERY",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof OrderStatus)[number];

export const PaymentMethod = ["CARD", "TRANSFER", "CASH"] as const;
export type PaymentMethod = (typeof PaymentMethod)[number];

export const ShippingType = ["STANDARD", "EXPRESS", "PICKUP"] as const;
export type ShippingType = (typeof ShippingType)[number];

export const OtpType = [
  "LOGIN",
  "VERIFY_PHONE",
  "RESET_PASSWORD",
  "ORDER_CONFIRMATION",
] as const;
export type OtpType = (typeof OtpType)[number];

export const Currency = ["NGN", "USD", "GBP"] as const;
export type Currency = (typeof Currency)[number];

export const PaymentProvider = [
  "PAYSTACK",
  "MONNIFY",
  "BANK_TRANSFER",
] as const;
export type PaymentProvider = (typeof PaymentProvider)[number];

export const FulfillmentStatus = [
  "PENDING",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "FAILED",
] as const;
export type FulfillmentStatus = (typeof FulfillmentStatus)[number];

export const Severity = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type Severity = (typeof Severity)[number];

// === AUTO-GENERATED END ===
