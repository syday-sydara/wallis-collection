import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentsApi, PaymentCreateInput, PaymentVerifyInput } from "@/lib/api/payments";
import { orderKeys } from "./orders";

export function useCreatePayment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: PaymentCreateInput) =>
      paymentsApi.create(input),

    onSuccess: (payment) => {
      qc.invalidateQueries({
        queryKey: orderKeys.detail(payment.orderId),
      });
    },
  });
}

export function useVerifyPayment() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: PaymentVerifyInput) =>
      paymentsApi.verify(input),

    onSuccess: (payment) => {
      qc.invalidateQueries({
        queryKey: orderKeys.detail(payment.orderId),
      });
    },
  });
}
