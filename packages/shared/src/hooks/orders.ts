import { ordersApi } from "../api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useOrders = () =>
  useQuery({
    queryKey: ["orders"],
    queryFn: ordersApi.list,
  });

export const useOrder = (id: string) =>
  useQuery({
    queryKey: ["orders", id],
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
  });

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
};

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: (_, { id }) =>
      qc.invalidateQueries({ queryKey: ["orders", id] }),
  });
};

export const useCancelOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.cancel,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
};
