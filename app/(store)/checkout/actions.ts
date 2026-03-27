// app/(store)/checkout/actions.ts
"use server";

import { CheckoutPayloadSchema } from "@/lib/checkout/schema";
import { processCheckout } from "@/lib/checkout/service";
import * as Sentry from "@sentry/nextjs";

export type CheckoutActionState = {
  success: boolean | null;
  message: string | null;
  fieldErrors: Record<string, string[] | undefined>;
  orderId?: string;
  paymentUrl?: string;
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
  try {
    const raw: Record<string, any> = {};
    formData.forEach((value, key) => {
      raw[key] = typeof value === "string" ? value.trim() : value;
    });

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
      return {
        success: false,
        message: "Please correct the highlighted fields",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    const result = await processCheckout(parsed.data);

    return {
      success: true,
      message: null,
      fieldErrors: {},
      orderId: result.orderId,
      paymentUrl: result.paymentUrl
    };
  } catch (err) {
    Sentry.captureException(err);
    return {
      success: false,
      message: "Unexpected error occurred. Please try again.",
      fieldErrors: {}
    };
  }
}
