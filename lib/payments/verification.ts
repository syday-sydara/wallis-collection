// lib/payments/verification.ts
import { verifyPaystackReference } from "./providers/paystack";
import { verifyMonnifyReference } from "./providers/monnify";
import type { PaymentProvider, PaymentVerificationResult } from "./types";
import { logFraudSignal, logEvent } from "@/lib/auth/logger";

export async function verifyPayment(provider: PaymentProvider, reference: string): Promise<PaymentVerificationResult> {
  const normalized = provider.toLowerCase() as PaymentProvider;
  try {
    let result: PaymentVerificationResult;
    switch (normalized) {
      case "paystack": result = await verifyPaystackReference(reference); break;
      case "monnify": result = await verifyMonnifyReference(reference); break;
      default: throw new Error(`Unsupported provider: ${provider}`);
    }

    if (result.status === "failed") await logFraudSignal({ type: "PAYMENT_VERIFICATION_FAILED", provider: normalized, reference, metadata: { result } });
    logEvent("payment_verified", { provider: normalized, reference, status: result.status });
    return result;
  } catch (err) {
    return { status: "error", provider: normalized, reference, message: (err as Error).message, raw: err };
  }
}