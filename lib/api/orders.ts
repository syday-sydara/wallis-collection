import { http } from "./http";
import {
  OrderSchema,
  OrderListSchema,
  Order,
} from "../schemas/order";

// Optional: strongly typed status enum
export type OrderStatus = Order["status"];

// Optional: strongly typed create input
export interface OrderCreateInput {
  phone: string;
  reservationIds: string[];
}

export const ordersApi = {
  create: (input: OrderCreateInput): Promise<Order> =>
    http.post<Order>("/api/orders/create", input, OrderSchema),

  get: (id: string): Promise<Order> =>
    http.get<Order>(`/api/orders/${id}`, OrderSchema),

  list: (): Promise<Order[]> =>
    http.get<Order[]>("/api/orders", OrderListSchema),

  updateStatus: (
    id: string,
    status: OrderStatus
  ): Promise<Order> =>
    http.put<Order>(
      `/api/orders/${id}`,
      { status },
      OrderSchema
    ),

  cancel: (id: string): Promise<Order> =>
    http.post<Order>(
      `/api/orders/${id}/cancel`,
      {},
      OrderSchema
    ),
};
