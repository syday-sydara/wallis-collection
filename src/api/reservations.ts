import { http } from "./http";
import {
  StockReservationSchema,
  ReservationListSchema,
  StockReservation,
} from "@/schemas";

// Strongly typed create input
export interface ReservationCreateInput {
  variantId: string;
  quantity: number;
  phone: string;
}

export interface ReservationExtendInput {
  minutes: number;
}

export const reservationsApi = {
  create: (input: ReservationCreateInput): Promise<StockReservation> =>
    http.post<StockReservation>(
      "/api/reservations/create",
      input,
      StockReservationSchema
    ),

  get: (id: string): Promise<StockReservation> =>
    http.get<StockReservation>(`/api/reservations/${id}`, StockReservationSchema),

  list: (): Promise<StockReservation[]> =>
    http.get<StockReservation[]>("/api/reservations", ReservationListSchema),

  extend: (id: string, input: ReservationExtendInput): Promise<StockReservation> =>
    http.post<StockReservation>(
      `/api/reservations/${id}/extend`,
      input,
      StockReservationSchema
    ),

  cancel: (id: string): Promise<StockReservation> =>
    http.post<StockReservation>(
      `/api/reservations/${id}/cancel`,
      {},
      StockReservationSchema
    ),
};
