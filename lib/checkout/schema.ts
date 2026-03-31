// lib/checkout/schema.ts
import { z } from "zod";

// --------------------
// Nigeria phone validation
// --------------------
const nigeriaPhoneRegex = /^(?:\+234|0)(70|80|81|90|91)\d{8}$/;

// --------------------
// Individual cart item
// --------------------
export const CheckoutItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  variantId: z.string().optional(), // optional variant
  unitPrice: z.number().int().nonnegative(), // include unit price for server validation
  name: z.string().min(1), // include product name for cart snapshot
  image: z.string().optional() // optional image for cart snapshot
});

// --------------------
// Full checkout payload
// --------------------
export const CheckoutPayloadSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  phone: z.string().regex(nigeriaPhoneRegex, "Enter a valid Nigerian phone number"),
  fullName: z.string().min(2, "Full name is required"),
  paymentMethod: z.enum(["PAYSTACK", "MONNIFY", "COD"], "Select a valid payment method"),
  shippingType: z.enum(["STANDARD", "EXPRESS"], "Select a valid shipping type"),
  address: z.string().min(5, "Address is too short"),
  city: z.string().min(2, "Enter a valid city"),
  state: z.string().min(2, "Enter a valid state"),
  shippingCost: z.number().nonnegative().optional(),
  total: z.number().nonnegative(),
  items: z.array(CheckoutItemSchema).min(1, "Cart cannot be empty")
});

// --------------------
// TypeScript types
// --------------------
export type CheckoutItem = z.infer<typeof CheckoutItemSchema>;
export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;