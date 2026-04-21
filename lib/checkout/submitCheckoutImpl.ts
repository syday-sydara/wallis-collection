import { CheckoutPayloadSchema } from "@/lib/checkout/schema";
import { processCheckout } from "@/lib/checkout/service";

export async function submitCheckoutImpl(
  prevState: any,
  formData: FormData,
  meta: { ip: string; userAgent: string; userId?: string | null }
) {
  const raw: Record<string, any> = {};

  formData.forEach((value, key) => {
    raw[key] = typeof value === "string" ? value.trim() : value;
  });

  let itemsJson: unknown;

  try {
    itemsJson = JSON.parse(raw.items);
  } catch {
    return {
      success: false,
      message: "Invalid cart data",
      fieldErrors: { items: ["Invalid items format"] },
    };
  }

  if (!Array.isArray(itemsJson)) {
    return {
      success: false,
      message: "Invalid cart data",
      fieldErrors: { items: ["Items must be an array"] },
    };
  }

  // Map CartItem → CheckoutItem
  const items = itemsJson.map((item: any) => ({
    productId: item.productId,
    variantId: item.id, // id === variantId
    name: item.name,
    image: item.image,
    quantity: item.quantity,
    price: item.unitPrice,
  }));

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

  try {
    const result = await processCheckout(parsed.data, meta);

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
