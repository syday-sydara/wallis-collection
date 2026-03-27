// lib/checkout/schema.ts
import { z } from "zod";

const nigeriaPhoneRegex = /^(?:\+234|0)(70|80|81|90|91)\d{8}$/;

export const CheckoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  variantId: z.string().optional()
});

export const CheckoutPayloadSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(nigeriaPhoneRegex, "Enter a valid Nigerian phone number"),
  fullName: z.string().min(2),
  paymentMethod: z.enum(["PAYSTACK", "MONNIFY"]),
  shippingType: z.enum(["STANDARD", "EXPRESS"]),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  items: z.array(CheckoutItemSchema).min(1)
});

export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;
