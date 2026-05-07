import { http } from "./http";
import {
  PaymentSchema,
  PaymentListSchema,
  Payment,
} from "@/schemas";

// Strongly typed payment provider
export type PaymentMethod = Payment["provider"];

// Strongly typed payment status
export type PaymentStatus = Payment["status"];

// Create input
export interface PaymentCreateInput {
  orderId: string;
  provider: PaymentMethod; // ← correct
}

// Verify input
export interface PaymentVerifyInput {
  paymentId: string;
}

export const paymentsApi = {
  create: (input: PaymentCreateInput): Promise<Payment> =>
    http.post<Payment>("/api/payments/create", input, PaymentSchema),

  verify: (input: PaymentVerifyInput): Promise<Payment> =>
    http.post<Payment>("/api/payments/verify", input, PaymentSchema),

  get: (id: string): Promise<Payment> =>
    http.get<Payment>(`/api/payments/${id}`, PaymentSchema),

  list: (): Promise<Payment[]> =>
    http.get<Payment[]>("/api/payments", PaymentListSchema),

  refund: (id: string): Promise<Payment> =>
    http.post<Payment>(`/api/payments/${id}/refund`, {}, PaymentSchema),
};
