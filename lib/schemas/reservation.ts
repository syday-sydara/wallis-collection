import { z } from "zod";

export const ReservationSchema = z.object({
  id: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive(),
  status: z.enum(["active", "expired", "released"]),
  expiresAt: z.string().datetime(),
});

export const ReservationListSchema = z.array(ReservationSchema);
export type Reservation = z.infer<typeof ReservationSchema>;
export type ReservationList = z.infer<typeof ReservationListSchema>;