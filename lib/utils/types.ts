// lib/payments/types.ts
export type PaymentProvider = "paystack" | "monnify";

export type PaymentVerificationStatus =
  | "success"
  | "pending"
  | "failed"
  | "error";

export interface BasePaymentVerification {
  provider: PaymentProvider;
  reference: string;
  raw: unknown;
  providerStatus?: string;
  signatureValid?: boolean;
  source?: "webhook" | "polling" | "manual";
  attempt?: number;
}

export interface PaymentSuccess extends BasePaymentVerification {
  status: "success";
  amount: number;
  currency: "NGN";
  paidAt?: string;
  providerTransactionId?: string;
  channel?: string;
  fee?: number;
  netAmount?: number;
  isFinal?: boolean;
}

export interface PaymentPending extends BasePaymentVerification {
  status: "pending";
  message?: string;
}

export interface PaymentFailed extends BasePaymentVerification {
  status: "failed";
  message?: string;
}

export interface PaymentError extends BasePaymentVerification {
  status: "error";
  message?: string;
}

export type PaymentVerificationResult =
  | PaymentSuccess
  | PaymentPending
  | PaymentFailed
  | PaymentError;
