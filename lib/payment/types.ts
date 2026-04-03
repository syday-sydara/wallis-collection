// lib/payments/types.ts
export type PaymentProvider = "paystack" | "monnify";

export type PaymentVerificationStatus =
  | "success"
  | "pending"
  | "failed"
  | "error";

export type PaymentVerificationResult =
  | {
      status: "success";
      provider: PaymentProvider;
      reference: string;
      amount: number;
      currency: "NGN";
      paidAt?: string;
      providerTransactionId?: string;
      channel?: string;
      isFinal?: boolean;
      raw: unknown;
    }
  | {
      status: "pending";
      provider: PaymentProvider;
      reference: string;
      message?: string;
      raw: unknown;
    }
  | {
      status: "failed";
      provider: PaymentProvider;
      reference: string;
      message?: string;
      raw: unknown;
    }
  | {
      status: "error";
      provider: PaymentProvider;
      reference: string;
      message?: string;
      raw: unknown;
    };