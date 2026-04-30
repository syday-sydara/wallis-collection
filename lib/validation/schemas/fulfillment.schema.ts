import { z } from "zod";

export const fulfillmentSchema = z.object({
  id: z.string().optional(),
  orderId: z.string(),

  carrier: z.string().nullable().optional(),
  tracking: z.string().nullable().optional(),

  status: z.enum([
    "PENDING",
    "IN_TRANSIT",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "FAILED",
  ]).default("PENDING"),
});
