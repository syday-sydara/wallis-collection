import { http } from "./http";
import { OrderSchema, Order } from "../schemas/order";

export const ordersApi = {
  create: (input: {
    phone: string;
    reservationIds: string[];
  }) =>
    http.post<Order>("/api/orders/create", input, OrderSchema),

  get: (id: string) =>
    http.get<Order>(`/api/orders/${id}`, OrderSchema),

  list: () =>
    http.get<Order[]>("/api/orders", OrderSchema.array()),
};
