import { z } from "zod";
import { NIGERIAN_STATES } from "@/lib/checkout/constants";

// More complete Nigerian phone validation
const nigeriaPhoneRegex = /^(?:\+234|0)(7[0-9]|8[0-9]|9[0-9])\d{8}$/;

export const CheckoutItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  price: z.number().int().nonnegative(), // renamed for consistency
  name: z.string().min(1),
  image: z.string().optional(),
  stock: z.number().int().nonnegative(), // optional but useful
});

export const CheckoutPayloadSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(nigeriaPhoneRegex, "Enter a valid Nigerian phone number"),
  fullName: z.string().min(2, "Full name is required"),
  paymentMethod: z.enum(["PAYSTACK", "MONNIFY", "COD"]),
  shippingType: z.enum(["STANDARD", "EXPRESS"]),
  address: z.string().min(5).max(200),
  city: z.string().min(2),
  state: z.enum(NIGERIAN_STATES),
  shippingCost: z.number().nonnegative().optional(),
  total: z.number().nonnegative().optional(),
  items: z.array(CheckoutItemSchema).min(1, "Cart cannot be empty"),
});

export type CheckoutItem = z.infer<typeof CheckoutItemSchema>;
export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;
