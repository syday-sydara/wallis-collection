import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api";

export const useWhatsAppOrders = () =>
  useQuery({
    queryKey: ["wa-orders"],
    queryFn: adminApi.whatsapp.list,
  });

export const useWhatsAppOrder = (id: string) =>
  useQuery({
    queryKey: ["wa-orders", id],
    queryFn: () => adminApi.whatsapp.get(id),
    enabled: !!id,
  });

export const useConvertWhatsAppOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.whatsapp.convertToOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wa-orders"] }),
  });
};

export const useArchiveWhatsAppOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.whatsapp.archive,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wa-orders"] }),
  });
};
