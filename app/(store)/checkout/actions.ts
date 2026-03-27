// app/(store)/checkout/actions.ts
"use server";

import { CheckoutPayloadSchema } from "@/lib/checkout/schema";
import { processCheckout } from "@/lib/checkout/service";
import { type CheckoutActionState } from "./types";
import * as Sentry from "@sentry/nextjs";

export async function submitCheckout(
  prevState: CheckoutActionState,
  formData: FormData
): Promise<CheckoutActionState> {
  try {
    // 1. Normalize FormData → plain object
    const raw: Record<string, any> = {};
    formData.forEach((value, key) => {
      raw[key] = typeof value === "string" ? value.trim() : value;
    });

    // 2. Parse items (required)
    let items;
    try {
      items = JSON.parse(raw.items);
    } catch {
      return {
        success: false,
        message: "Invalid cart data",
        fieldErrors: { items: ["Invalid items format"] }
      };
    }

    // 3. Build full payload
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

    // 4. Validate with Zod (strict enums, phone, items, etc.)
    const parsed = CheckoutPayloadSchema.safeParse(payload);

    if (!parsed.success) {
      return {
        success: false,
        message: "Please correct the highlighted fields",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    // 5. Process checkout (DB transaction, stock, order, payment session)
    const result = await processCheckout(parsed.data);

    return {
      success: true,
      message: null,
      fieldErrors: {},
      orderId: result.orderId,
      paymentUrl: result.paymentUrl
    };
  } catch (err) {
    // 6. Internal logging
    Sentry.captureException(err);

    return {
      success: false,
      message: "Unexpected error occurred. Please try again.",
      fieldErrors: {}
    };
  }
}
