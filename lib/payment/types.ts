// lib/payments/types.ts
export type PaymentProvider = "paystack" | "monnify";

export type PaymentVerificationStatus = "success" | "failed" | "pending";

export interface PaymentVerificationResult {
  provider: PaymentProvider;
  reference: string;
  status: PaymentVerificationStatus;
  raw: unknown;
}
