import { http } from "./http";
import { PaymentSchema, Payment } from "../schemas/payment";

export const paymentsApi = {
  create: (input: { orderId: string; method: string }) =>
    http.post<Payment>("/api/payments/create", input, PaymentSchema),

  verify: (input: { paymentId: string }) =>
    http.post<Payment>("/api/payments/verify", input, PaymentSchema),
};
