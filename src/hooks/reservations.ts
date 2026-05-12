import { reservationsApi } from "../api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useReservations = () =>
  useQuery({
    queryKey: ["reservations"],
    queryFn: reservationsApi.list,
  });

export const useReservation = (id: string) =>
  useQuery({
    queryKey: ["reservations", id],
    queryFn: () => reservationsApi.get(id),
    enabled: !!id,
  });

export const useCreateReservation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reservationsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reservations"] }),
  });
};

export const useCancelReservation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reservationsApi.cancel,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reservations"] }),
  });
};

export const useExtendReservation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: number }) =>
      reservationsApi.extend(id, { minutes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reservations"] }),
  });
};
