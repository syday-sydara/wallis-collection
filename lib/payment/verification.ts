// lib/payments/verification.ts
import type {
  PaymentProvider,
  PaymentVerificationResult
} from "@/lib/payment/types";
import { verifyPaystackReference } from "./providers/paystack";
import { verifyMonnifyReference } from "./providers/monnify";
import { logFraudSignal } from "@/lib/security/fraud";

export async function verifyPayment(
  provider: PaymentProvider,
  reference: string
): Promise<PaymentVerificationResult> {
  let result: PaymentVerificationResult;

  switch (provider) {
    case "paystack":
      result = await verifyPaystackReference(reference);
      break;
    case "monnify":
      result = await verifyMonnifyReference(reference);
      break;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }

  // Fraud detection example
  if (result.status === "failed") {
    await logFraudSignal({
      type: "WEBHOOK_PROVIDER_MISMATCH",
      provider,
      reference,
      metadata: { result }
    });
  }

  return result;
}
