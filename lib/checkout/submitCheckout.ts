import { CheckoutPayloadSchema } from "@/lib/checkout/schema";
import { processCheckout } from "@/lib/checkout/service";

export async function submitCheckoutImpl(prevState, formData) {
  const raw = {};
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
}