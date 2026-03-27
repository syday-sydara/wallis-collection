// app/(store)/checkout/actions.ts
"use server";

import * as Sentry from "@sentry/nextjs";
import { CheckoutPayloadSchema } from "@/lib/checkout/schema";
import { processCheckout } from "@/lib/checkout/service";
import { logEvent } from "@/lib/logger";
import { startTimer } from "@/lib/metrics";

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

        const result = await processCheckout(parsed.data);

        logEvent("checkout_success", {
          email: parsed.data.email,
          orderId: result.orderId,
          hasPaymentUrl: Boolean(result.paymentUrl)
        });

        endTimer();

        return {
          success: true,
          message: null,
          fieldErrors: {},
          orderId: result.orderId,
          paymentUrl: result.paymentUrl ?? null
        };
      } catch (err: any) {
        Sentry.captureException(err);

        logEvent(
          "checkout_unexpected_error",
          {
            message: err?.message,
            stack: err?.stack
          },
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
