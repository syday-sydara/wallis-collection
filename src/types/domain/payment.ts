export interface Payment {
  id: string;
  orderId: string;
  status: "pending" | "verified" | "failed";
  verifiedAt?: string;
}
