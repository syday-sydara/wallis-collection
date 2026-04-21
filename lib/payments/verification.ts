// lib/payments/verification.ts
import { verifyPaystackReference } from "./providers/paystack";
import { verifyMonnifyReference } from "./providers/monnify";

import type {
  PaymentProvider,
  PaymentVerificationResult,
} from "./types";

import { logFraudSignal } from "@/lib/security/fraud";
import { logSecurityEvent } from "@/lib/security/logSecurityEvent";

interface VerificationOptions {
  rawPayload?: unknown;
  source?: "webhook" | "reconciliation" | "manual";
}

export async function verifyPayment(
  provider: PaymentProvider,
  reference: string,
  options: VerificationOptions = {}
): Promise<PaymentVerificationResult> {
  const normalized = provider.toLowerCase() as PaymentProvider;
  const { rawPayload, source } = options;

  try {
    let result: PaymentVerificationResult;

    switch (normalized) {
      case "paystack":
        result = await verifyPaystackReference(reference, {
          rawPayload,
          source,
        });
        break;

      case "monnify":
        result = await verifyMonnifyReference(reference, {
          rawPayload,
          source,
        });
        break;

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    // --- Signature validation ---
    if ((result as any).signatureValid === false) {
      await logFraudSignal({
        type: "INVALID_SIGNATURE",
        provider: normalized,
        reference,
        metadata: { source },
      });

      await logSecurityEvent({
        type: "PAYMENT_INVALID_SIGNATURE",
        message: `Invalid signature for ${normalized} payment ${reference}`,
        severity: "critical",
        metadata: { provider: normalized, reference, source },
      });

      return {
        status: "error",
        provider: normalized,
        reference,
        message: "Invalid signature",
        raw: result.raw,
      };
    }

    // --- Provider-level failure ---
    if (result.status === "failed") {
      await logFraudSignal({
        type: "PAYMENT_VERIFICATION_FAILED",
        provider: normalized,
        reference,
        metadata: { result },
      });
    }

    // --- Log verification event ---
    await logSecurityEvent({
      type: "PAYMENT_VERIFIED",
      message: `Verified payment ${reference} via ${normalized}`,
      severity: "low",
      metadata: {
        provider: normalized,
        reference,
        status: result.status,
        source,
      },
    });

    return result;
  } catch (err) {
    const message = (err as Error).message;

    await logSecurityEvent({
      type: "PAYMENT_VERIFICATION_ERROR",
      message: `Error verifying payment ${reference}: ${message}`,
      severity: "medium",
      metadata: { provider: normalized, reference, source },
    });

    return {
      status: "error",
      provider: normalized,
      reference,
      message,
      raw: err,
    };
  }
}
