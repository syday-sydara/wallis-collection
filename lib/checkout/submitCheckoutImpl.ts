import { CheckoutPayloadSchema } from "@/lib/checkout/schema";
import { processCheckout } from "@/lib/checkout/service";

export async function submitCheckoutImpl(prevState: any, formData: FormData) {
  const raw: Record<string, any> = {};

  // Normalize form fields
  formData.forEach((value, key) => {
    raw[key] = typeof value === "string" ? value.trim() : value;
  });

  /* -------------------------------------------------- */
  /* Parse cart items                                    */
  /* -------------------------------------------------- */
  let items: unknown;

  try {
    items = JSON.parse(raw.items);
  } catch {
    return {
      success: false,
      message: "Invalid cart data",
      fieldErrors: { items: ["Invalid items format"] },
    };
  }

  if (!Array.isArray(items)) {
    return {
      success: false,
      message: "Invalid cart data",
      fieldErrors: { items: ["Items must be an array"] },
    };
  }

  /* -------------------------------------------------- */
  /* Build payload (server‑side authoritative fields)    */
  /* -------------------------------------------------- */
  const payload = {
    email: raw.email,
    phone: raw.phone,
    fullName: raw.fullName,
    paymentMethod: raw.paymentMethod,
    shippingType: raw.shippingType,
    address: raw.address,
    city: raw.city,
    state: raw.state,
    items,
  };

  /* -------------------------------------------------- */
  /* Validate with Zod                                   */
  /* -------------------------------------------------- */
  const schema = CheckoutPayloadSchema.omit({
    total: true,
    shippingCost: true,
  });

  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  /* -------------------------------------------------- */
  /* Server‑side checkout processing                     */
  /* -------------------------------------------------- */
  try {
    const result = await processCheckout(parsed.data);

    return {
      success: true,
      message: null,
      fieldErrors: {},
      orderId: result.orderId,
      paymentUrl: result.paymentUrl,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "An error occurred during checkout.",
      fieldErrors: { items: [err.message] },
    };
  }
}
