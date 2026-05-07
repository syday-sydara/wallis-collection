import { z } from "zod";

export const ShipmentStatusEnum = z.enum([
  "PENDING",
  "SHIPPED",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
]);

export const ShipmentProviderEnum = z.enum([
  "GIG_LOGISTICS",
  "DHL",
  "FEDEX",
  "UPS",
  "MANUAL",
]);

export const ShipmentSchema = z.object({
  id: z.string(),
  orderId: z.string(),

  provider: ShipmentProviderEnum.nullable(),

  trackingNumber: z.string().nullable().optional(),

  status: ShipmentStatusEnum,

  shippedAt: z.string().datetime().nullable(),
  deliveredAt: z.string().datetime().nullable(),

  metadata: z.any().nullable().optional(),
  error: z.any().nullable().optional(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Shipment = z.infer<typeof ShipmentSchema>;
export type ShipmentList = Shipment[];
