// lib/prisma/middleware/phone-normalization.ts
import { normalizePhone } from "../../../utils/phone";

export function phoneNormalizationMiddleware() {
  return async (params, next) => {
    const targetModels = ["Customer", "Order", "WhatsAppSession"];

    if (targetModels.includes(params.model)) {
      if (params.action === "create" || params.action === "update") {
        // Always clone before modifying
        const data = { ...params.args.data };

        // ------------------------------------------------------
        // Normalize primary phone field
        // ------------------------------------------------------
        if (data.phone) {
          const normalized = normalizePhone(data.phone);

          if (!normalized) {
            throw new Error("Invalid phone number");
          }

          data.phone = normalized;
          data.phoneNormalized = normalized;
        }

        // ------------------------------------------------------
        // Normalize phoneNormalized if provided directly
        // (e.g., manual override)
        // ------------------------------------------------------
        if (data.phoneNormalized) {
          const normalized = normalizePhone(data.phoneNormalized);

          if (!normalized) {
            throw new Error("Invalid phoneNormalized value");
          }

          data.phoneNormalized = normalized;
        }

        // Apply modified data back
        params.args.data = data;
      }
    }

    return next(params);
  };
}
