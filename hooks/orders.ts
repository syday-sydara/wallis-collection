import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi, OrderCreateInput, OrderStatus } from "@/lib/api/orders";

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: () => [...orderKeys.lists(), "default"] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.list(),
    queryFn: () => ordersApi.list(),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: OrderCreateInput) => ordersApi.create(input),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.list() });
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),

    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: orderKeys.detail(id) });
      qc.invalidateQueries({ queryKey: orderKeys.list() });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersApi.cancel(id),

    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: orderKeys.detail(id) });
      qc.invalidateQueries({ queryKey: orderKeys.list() });
    },
  });
}
