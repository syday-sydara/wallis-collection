import { z } from "zod";
import { NIGERIAN_STATES } from "@/lib/checkout/constants";

/* -------------------------------------------------- */
/* Helpers                                             */
/* -------------------------------------------------- */

// Nigerian phone validation
const nigeriaPhoneRegex =
  /^(?:\+234|0)(7[0-9]|8[0-9]|9[0-9])\d{8}$/;

// Trim AFTER validation
const trimmedString = z.string().min(1).transform((v) => v.trim());

// Validate number first, THEN transform
const numericField = z
  .union([
    z.number().nonnegative(),
    z.string().regex(/^\d+$/, "Invalid number"),
  ])
  .transform((v) => Number(v));

const integerField = z
  .union([
    z.number().int().nonnegative(),
    z.string().regex(/^\d+$/, "Invalid integer"),
  ])
  .transform((v) => Number(v));

/* -------------------------------------------------- */
/* Item Schema                                         */
/* -------------------------------------------------- */

export const CheckoutItemSchema = z.object({
  productId: trimmedString,
  variantId: trimmedString,

  quantity: z
    .union([
      z.number().int().positive(),
      z.string().regex(/^[1-9]\d*$/, "Quantity must be at least 1"),
    ])
    .transform((v) => Number(v)),

  price: integerField, // validated first, then transformed

  name: trimmedString,
  image: z.string().optional(),

  stock: integerField.optional(),
});

/* -------------------------------------------------- */
/* Payload Schema                                      */
/* -------------------------------------------------- */

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

  shippingCost: numericField.optional(),
  total: numericField.optional(),

  items: z.array(CheckoutItemSchema).min(1).max(50),
});

/* -------------------------------------------------- */
/* Types                                               */
/* -------------------------------------------------- */

export type CheckoutItem = z.infer<typeof CheckoutItemSchema>;
export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;
