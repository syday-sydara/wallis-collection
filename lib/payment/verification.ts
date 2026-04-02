// lib/payments/verification.ts
import type {
  PaymentProvider,
  PaymentVerificationResult
} from "@/lib/payment/types";
import { verifyPaystackReference } from "./providers/paystack";
import { verifyMonnifyReference } from "./providers/monnify";
import { logFraudSignal } from "@/lib/security/fraud";
import { logEvent } from "@/lib/logger";

export async function verifyPayment(
  provider: PaymentProvider,
  reference: string
): Promise<PaymentVerificationResult> {
  let result: PaymentVerificationResult;

  // Normalize provider input
  const normalized = provider.toLowerCase() as PaymentProvider;

  try {
    switch (normalized) {
      case "paystack":
        result = await verifyPaystackReference(reference);
        break;

      case "monnify":
        result = await verifyMonnifyReference(reference);
        break;

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (err) {
    // Provider API failure
    return {
      status: "error",
      provider: normalized,
      reference,
      raw: err,
    };
  }

  // Fraud detection
  if (result.status === "failed") {
    await logFraudSignal({
      type: "PAYMENT_VERIFICATION_FAILED",
      provider: normalized,
      reference,
      metadata: { result }
    });
  }

  // Observability
  logEvent("payment_verified", {
    provider: normalized,
    reference,
    status: result.status
  });

  return result;
}