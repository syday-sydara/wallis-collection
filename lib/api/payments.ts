import { http } from "./http";
import {
  PaymentSchema,
  Payment,
  PaymentListSchema,
} from "../../packages/shared/src/schemas/payment";

// Strongly typed payment method
export type PaymentMethod = Payment["method"];

// Strongly typed payment status
export type PaymentStatus = Payment["status"];

// Create input
export interface PaymentCreateInput {
  orderId: string;
  method: PaymentMethod;
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

  // Optional but recommended for admin flows
  get: (id: string): Promise<Payment> =>
    http.get<Payment>(`/api/payments/${id}`, PaymentSchema),

  list: (): Promise<Payment[]> =>
    http.get<Payment[]>("/api/payments", PaymentListSchema),

  // Optional lifecycle endpoint
  refund: (id: string): Promise<Payment> =>
    http.post<Payment>(`/api/payments/${id}/refund`, {}, PaymentSchema),
};
