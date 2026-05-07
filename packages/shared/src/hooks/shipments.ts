import { adminApi } from "@/sdk";

export const useShipments = () =>
  useQuery({
    queryKey: ["shipments"],
    queryFn: adminApi.shipments.list,
  });

export const useShipment = (id: string) =>
  useQuery({
    queryKey: ["shipments", id],
    queryFn: () => adminApi.shipments.get(id),
    enabled: !!id,
  });

export const useUpdateShipmentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.shipments.updateStatus(id, status),
    onSuccess: (_, { id }) =>
      qc.invalidateQueries({ queryKey: ["shipments", id] }),
  });
};
