import { paymentsApi } from "@/sdk";

export const usePayments = () =>
  useQuery({
    queryKey: ["payments"],
    queryFn: paymentsApi.list,
  });

export const usePayment = (id: string) =>
  useQuery({
    queryKey: ["payments", id],
    queryFn: () => paymentsApi.get(id),
    enabled: !!id,
  });

export const useCreatePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
};

export const useVerifyPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.verify,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
};

export const useRefundPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentsApi.refund,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
};
