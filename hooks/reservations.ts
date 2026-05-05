import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationsApi, ReservationCreateInput } from "@/lib/api/reservations";

export const reservationKeys = {
  all: ["reservations"] as const,
  lists: () => [...reservationKeys.all, "list"] as const,
  list: () => [...reservationKeys.lists(), "default"] as const,
  detail: (id: string) => [...reservationKeys.all, "detail", id] as const,
};

export function useReservations() {
  return useQuery({
    queryKey: reservationKeys.list(),
    queryFn: () => reservationsApi.list(),
  });
}

export function useReservation(id: string) {
  return useQuery({
    queryKey: reservationKeys.detail(id),
    queryFn: () => reservationsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: ReservationCreateInput) =>
      reservationsApi.create(input),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reservationKeys.list() });
    },
  });
}

export function useCancelReservation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reservationsApi.cancel(id),

    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: reservationKeys.detail(id) });
      qc.invalidateQueries({ queryKey: reservationKeys.list() });
    },
  });
}
