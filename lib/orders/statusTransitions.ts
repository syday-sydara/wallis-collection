import { ORDER_STATUS_TRANSITIONS, OrderStatus } from "./OrderStatus";

export function getNextStatuses(current: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[current] || [];
}
