// app/(store)/checkout/actions.ts
"use server";

import * as Sentry from "@sentry/nextjs";
import { headers } from "next/headers";
import { CheckoutPayloadSchema } from "@/lib/checkout/schema";
import { processCheckout } from "@/lib/checkout/service";
import { logEvent } from "@/lib/logger";
import { startTimer } from "@/lib/metrics";
import { checkRateLimit } from "@/lib/rate-limit";
import { getIdempotentResponse, saveIdempotentResponse } from "@/lib/idempotency";
import { buildRiskContext } from "@/lib/risk/context";

export type CheckoutActionState = {
  success: boolean | null;
  message: string | null;
  fieldErrors: Record<string, string[] | undefined>;
  orderId?: string;
  paymentUrl?: string | null;
};

const initialState: CheckoutActionState = {
  success: null,
  message: null,
  fieldErrors: {}
};

export { initialState as checkoutInitialState };

export async function submitCheckout(
  prevState: CheckoutActionState,
  formData: FormData
): Promise<CheckoutActionState> {
  return Sentry.startSpan(
    { name: "checkout.submit", op: "server.action" },
    async () => {
      const endTimer = startTimer("checkout_server_action");

      const hdrs = headers();
      const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      const userAgent = hdrs.get("user-agent") ?? "unknown";

      const rate = checkRateLimit(`checkout:${ip}`);
      if (!rate.allowed) {
        logEvent("checkout_rate_limited", { ip, userAgent }, "warn");
        endTimer();
        return {
          success: false,
          message: "Too many attempts. Please wait a moment and try again.",
          fieldErrors: {}
        };
      }

      const idempotencyKey =
        hdrs.get("x-idempotency-key") ??
        (formData.get("idempotencyKey") as string | null) ??
        null;

      if (idempotencyKey) {
        const cached = getIdempotentResponse(idempotencyKey);
        if (cached) {
          logEvent("checkout_idempotent_reuse", { idempotencyKey, ip });
          endTimer();
          return cached;
        }
      }

      try {
        const raw: Record<string, any> = {};
        formData.forEach((value, key) => {
          raw[key] = typeof value === "string" ? value.trim() : value;
        });

        let items;
        try {
          items = JSON.parse(raw.items);
        } catch {
          logEvent("checkout_invalid_items_json", { rawItems: raw.items }, "warn");
          endTimer();
          return {
            success: false,
            message: "Invalid cart data",
            fieldErrors: { items: ["Invalid items format"] }
          };
        }

        const payload = {
          email: raw.email,
          phone: raw.phone,
          fullName: raw.fullName,
          paymentMethod: raw.paymentMethod,
          shippingType: raw.shippingType,
          address: raw.address,
          city: raw.city,
          state: raw.state,
          items
        };

        const parsed = CheckoutPayloadSchema.safeParse(payload);
        if (!parsed.success) {
          const flattened = parsed.error.flatten().fieldErrors;
          logEvent("checkout_validation_failed", {
            email: payload.email,
            fieldErrors: flattened
          });
          endTimer();
          return {
            success: false,
            message: "Please correct the highlighted fields",
            fieldErrors: flattened
          };
        }

        logEvent("checkout_attempt", {
          email: parsed.data.email,
          itemsCount: parsed.data.items.length,
          shippingType: parsed.data.shippingType,
          paymentMethod: parsed.data.paymentMethod
        });

        const cartValue =
          parsed.data.items.reduce(
            (sum, item) => sum + (item.unitPrice ?? 0) * item.quantity,
            0
          ) ?? 0;

        const riskContext = buildRiskContext({
          ip,
          email: parsed.data.email,
          phone: parsed.data.phone,
          userAgent,
          attempts: rate.remaining,
          cartValue,
          shippingState: parsed.data.state
        });

        const result = await processCheckout(parsed.data, riskContext);

        logEvent("checkout_success", {
          email: parsed.data.email,
          orderId: result.orderId,
          hasPaymentUrl: Boolean(result.paymentUrl)
        });

        const response: CheckoutActionState = {
          success: true,
          message: null,
          fieldErrors: {},
          orderId: result.orderId,
          paymentUrl: result.paymentUrl ?? null
        };

        if (idempotencyKey) {
          saveIdempotentResponse(idempotencyKey, response);
        }

        endTimer();
        return response;
      } catch (err: any) {
        Sentry.captureException(err);
        logEvent(
          "checkout_unexpected_error",
          { message: err?.message, stack: err?.stack },
          "error"
        );
        endTimer();
        return {
          success: false,
          message: "Unexpected error occurred. Please try again.",
          fieldErrors: {}
        };
      }
    }
  );
}
