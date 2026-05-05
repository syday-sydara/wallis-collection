import { z } from "zod";

export const ReservationSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive(),
  expiresAt: z.string().datetime(),
  createdAt: z.string().datetime(),
});

export type Reservation = z.infer<typeof ReservationSchema>;
export type ReservationList = Reservation[];
