import { http } from "./http";
import {
  ReservationSchema,
  ReservationListSchema,
  Reservation,
} from "../../packages/shared/src/schemas/reservation";

// Strongly typed create input
export interface ReservationCreateInput {
  variantId: string;
  quantity: number;
  phone: string;
}

export const reservationsApi = {
  create: (input: ReservationCreateInput): Promise<Reservation> =>
    http.post<Reservation>(
      "/api/reservations/create",
      input,
      ReservationSchema
    ),

  // Optional but recommended for admin + debugging flows
  get: (id: string): Promise<Reservation> =>
    http.get<Reservation>(`/api/reservations/${id}`, ReservationSchema),

  list: (): Promise<Reservation[]> =>
    http.get<Reservation[]>("/api/reservations", ReservationListSchema),

  // Optional lifecycle endpoint
  cancel: (id: string): Promise<Reservation> =>
    http.post<Reservation>(
      `/api/reservations/${id}/cancel`,
      {},
      ReservationSchema
    ),
};
