import { z } from "zod";

export const ShipmentStatusEnum = z.enum([
  "PENDING",
  "SHIPPED",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
]);

export const ShipmentSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  provider: z.string().nullable(),
  trackingNumber: z.string().nullable(),
  status: ShipmentStatusEnum,
  shippedAt: z.string().datetime().nullable(),
  deliveredAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export type Shipment = z.infer<typeof ShipmentSchema>;
