export type OrderStatus =
  | "pending"
  | "processing"
  | "completed"
  | "cancelled";

export interface Order {
  id: string;
  customerName: string;
  phoneNumber: string; // e.g. +2348012345678
  status: OrderStatus;
  totalAmount: number; // stored in kobo or naira depending on your decision
  createdAt: string;   // ISO string
  updatedAt: string;   // ISO string
}
