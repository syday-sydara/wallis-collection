import { z } from "zod";

export const ReservationStatusEnum = z.enum([
  "ACTIVE",
  "CONSUMED",
  "RELEASED",
]);

export const StockReservationSchema = z.object({
  id: z.string(),
  variantId: z.string(),
  orderId: z.string().nullable(),
  status: ReservationStatusEnum,
  quantity: z.number().int(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type StockReservation = z.infer<typeof StockReservationSchema>;
