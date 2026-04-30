// === AUTO-GENERATED START ===
import { z } from "zod";

export const FulfillmentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  order: OrderSchema,
  carrier: z.string().optional(),
  tracking: z.string().optional(),
  status: z.enum([
    "PENDING",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "FAILED",
  ]),
  createdAt: z.date(),
  updatedAt: z.date(),
});
// === AUTO-GENERATED END ===
