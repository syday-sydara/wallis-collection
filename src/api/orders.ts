import { http } from "./http";
import {
  OrderSchema,
  OrderListSchema,
  Order,
} from "@/schemas";

// Strongly typed status enum
export type OrderStatus = Order["status"];

// Strongly typed create input
export interface OrderCreateInput {
  phone: string;
  reservationIds: string[];
}

export interface OrderAddressUpdateInput {
  addressLine1: string;
  addressLine2?: string | null;
  city?: string | null;
  state: string;
  lga?: string | null;
  landmark?: string | null;
  deliveryNote?: string | null;
}

export const ordersApi = {
  create: (input: OrderCreateInput): Promise<Order> =>
    http.post<Order>("/api/orders/create", input, OrderSchema),

  get: (id: string): Promise<Order> =>
    http.get<Order>(`/api/orders/${id}`, OrderSchema),

  list: (): Promise<Order[]> =>
    http.get<Order[]>("/api/orders", OrderListSchema),

  updateStatus: (id: string, status: OrderStatus): Promise<Order> =>
    http.put<Order>(
      `/api/orders/${id}/status`,
      { status },
      OrderSchema
    ),

  updateAddress: (id: string, input: OrderAddressUpdateInput): Promise<Order> =>
    http.put<Order>(
      `/api/orders/${id}/address`,
      input,
      OrderSchema
    ),

  cancel: (id: string): Promise<Order> =>
    http.post<Order>(
      `/api/orders/${id}/cancel`,
      {},
      OrderSchema
    ),
};
