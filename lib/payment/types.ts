// lib/payments/types.ts
export type PaymentProvider = "paystack" | "monnify";

export type PaymentVerificationStatus =
  | "success"
  | "failed"
  | "pending"
  | "error";

export interface PaymentVerificationResult {
  provider: PaymentProvider;
  reference: string;
  status: PaymentVerificationStatus;

  // Optional metadata returned by providers
  amount?: number;
  currency?: string;
  paidAt?: string;
  channel?: string;
  providerTransactionId?: string;

  // Optional context
  source?: "webhook" | "reconciliation" | "manual";
  message?: string;

  // Raw provider response for debugging
  raw: unknown;
}