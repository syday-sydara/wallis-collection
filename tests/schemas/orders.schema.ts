import { z } from "zod";

export const OrderStatusEnum = z.enum([
  "pending",
  "processing",
  "completed",
  "cancelled",
]);

export const OrdersSchema = z.object({
  id: z.string().uuid(),

  customerName: z.string().min(2, "Customer name is too short"),

  // Nigerian phone number validation (+234 or 0XXXXXXXXXX)
  phoneNumber: z
    .string()
    .regex(
      /^(\+234|0)[0-9]{10}$/,
      "Invalid Nigerian phone number format"
    ),

  status: OrderStatusEnum,

  // Naira amount (must be >= 0)
  totalAmount: z.number().nonnegative(),

  // ISO timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
