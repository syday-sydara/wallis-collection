export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "CANCELLED";

export interface Order {
  id: string;

  customerName: string;

  // Nigerian phone number (E.164 format)
  phoneNumber: string;

  // Must match backend enum
  status: OrderStatus;

  // Amount in kobo (recommended) or naira
  totalAmount: number;

  // ISO timestamps
  createdAt: string;
  updatedAt: string;
}
