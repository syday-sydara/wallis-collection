import { http } from "./http";
import { ReservationSchema, Reservation } from "../schemas/reservation";

export const reservationsApi = {
  create: (input: {
    variantId: string;
    quantity: number;
    phone: string;
  }) =>
    http.post<Reservation>(
      "/api/reservations/create",
      input,
      ReservationSchema
    ),
};
