import { CheckoutPayloadSchema } from "@/lib/checkout/schema";
import { processCheckout } from "@/lib/checkout/service";

export async function submitCheckoutImpl(prevState: any, formData: FormData) {
  const raw: Record<string, any> = {};

  formData.forEach((value, key) => {
    raw[key] = typeof value === "string" ? value.trim() : value;
  });

  // Parse cart items
  let items: any;
  try {
    items = JSON.parse(raw.items);
  } catch {
    return {
      success: false,
      message: "Invalid cart data",
      fieldErrors: { items: ["Invalid items format"] }
    };
  }

  if (!Array.isArray(items)) {
    return {
      success: false,
      message: "Invalid cart data",
      fieldErrors: { items: ["Items must be an array"] }
    };
  }

  // Build payload
  const payload = {
    email: raw.email,
    phone: raw.phone,
    fullName: raw.fullName,
    paymentMethod: raw.paymentMethod,
    shippingType: raw.shippingType,
    address: raw.address?.trim(),
    city: raw.city?.trim(),
    state: raw.state?.trim(),
    items
  };

  // Validate with Zod
  const parsed = CheckoutPayloadSchema
    .omit({ total: true, shippingCost: true })
    .safeParse(payload);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  // Server-side processing
  try {
    const result = await processCheckout(parsed.data);

    return {
      success: true,
      message: null,
      fieldErrors: {},
      orderId: result.orderId,
      paymentUrl: result.paymentUrl
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "An error occurred during checkout.",
      fieldErrors: { items: [err.message] }
    };
  }
}
