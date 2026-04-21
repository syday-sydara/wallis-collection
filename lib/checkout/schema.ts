import { z } from "zod";
import { NIGERIAN_STATES } from "@/lib/constants/nigerian-states";

const nigeriaPhoneRegex =
  /^(?:\+234|0)(7\d|8\d|9\d)\d{8}$/;

const trimmedString = z.string().min(1).transform((v) => v.trim());

const integerField = z
  .union([
    z.number().int().nonnegative(),
    z.string().regex(/^\d+$/, "Invalid integer"),
  ])
  .transform((v) => Number(v));

export const CheckoutItemSchema = z.object({
  productId: trimmedString,
  variantId: trimmedString,
  name: trimmedString,
  image: z.string().url().optional(),
  quantity: z
    .union([
      z.number().int().positive(),
      z.string().regex(/^[1-9]\d*$/, "Quantity must be at least 1"),
    ])
    .transform((v) => Number(v)),
  price: integerField, // server-side name for unitPrice
});

export const CheckoutPayloadSchema = z.object({
  email: z.string().email().transform((v) => v.trim()),
  phone: z
    .string()
    .regex(nigeriaPhoneRegex, "Enter a valid Nigerian phone number")
    .transform((v) => v.trim()),
  fullName: z.string().min(2).max(100).transform((v) => v.trim()),
  paymentMethod: z.enum(["PAYSTACK", "MONNIFY", "COD"]),
  shippingType: z.enum(["STANDARD", "EXPRESS"]),
  address: z.string().min(5).max(200).transform((v) => v.trim()),
  city: z.string().min(2).max(100).transform((v) => v.trim()),
  state: z.enum(NIGERIAN_STATES),
  shippingCost: integerField.optional(),
  total: integerField.optional(),
  items: z.array(CheckoutItemSchema).min(1).max(50),
});

export type CheckoutItem = z.infer<typeof CheckoutItemSchema>;
export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;
