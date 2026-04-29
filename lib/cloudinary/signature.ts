// lib/cloudinary/signature.ts

import { cloudinary } from ".";
import { emitSecurityEvent } from "@/lib/events/emitter";

export function generateUploadSignature(
  params: Record<string, string | number>
) {
  const secret = process.env.CLOUDINARY_API_SECRET;

  /* -------------------------------------------------- */
  /* Validate secret                                     */
  /* -------------------------------------------------- */
  if (!secret) {
    emitSecurityEvent({
      type: "CLOUDINARY_SIGNATURE_MISSING_SECRET",
      message: "Missing CLOUDINARY_API_SECRET for signature generation",
      severity: "high",
      context: "cloudinary",
      operation: "sign",
      category: "media",
      tags: ["cloudinary", "signature_missing_secret"],
      metadata: {},
      source: "cloudinary_api",
    });

    return { ok: false, error: "missing_secret" };
  }

  /* -------------------------------------------------- */
  /* Normalize + sanitize params                         */
  /* -------------------------------------------------- */
  const timestamp = Math.floor(Date.now() / 1000);

  // Prevent unsafe fields from being signed
  const forbiddenKeys = ["signature", "api_key", "api_secret"];

  for (const key of forbiddenKeys) {
    if (key in params) {
      emitSecurityEvent({
        type: "CLOUDINARY_SIGNATURE_FORBIDDEN_PARAM",
        message: `Forbidden param in signature payload: ${key}`,
        severity: "medium",
        context: "cloudinary",
        operation: "sign",
        category: "media",
        tags: ["cloudinary", "signature_forbidden_param"],
        metadata: { key },
        source: "cloudinary_api",
      });

      return { ok: false, error: "forbidden_param", key };
    }
  }

  const payload = {
    ...params,
    timestamp,
  };

  /* -------------------------------------------------- */
  /* Generate signature                                  */
  /* -------------------------------------------------- */
  try {
    const signature = cloudinary.utils.api_sign_request(payload, secret);

    return {
      ok: true,
      signature,
      timestamp,
    };
  } catch (err: any) {
    emitSecurityEvent({
      type: "CLOUDINARY_SIGNATURE_ERROR",
      message: "Failed to generate Cloudinary upload signature",
      severity: "high",
      context: "cloudinary",
      operation: "sign",
      category: "media",
      tags: ["cloudinary", "signature_error"],
      metadata: { error: err?.message },
      source: "cloudinary_api",
    });

    return { ok: false, error: "signature_failed" };
  }
}
