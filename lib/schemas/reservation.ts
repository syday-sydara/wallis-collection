import { z } from "zod";

export const ReservationSchema = z.object({
  id: z.string(),
  variantId: z.string(),
  quantity: z.number(),
  status: z.string(),
  expiresAt: z.string(),
});

export type Reservation = z.infer<typeof ReservationSchema>;
