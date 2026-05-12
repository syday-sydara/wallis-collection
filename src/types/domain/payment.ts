export interface Payment {
  id: string;
  orderId: string;

  // Only the methods you support today
  method: "bank_transfer" | "cash";

  // Payment lifecycle
  status: "pending" | "verified" | "failed";

  // When the payment was manually verified
  verifiedAt?: string;

  // Who verified it (admin user)
  verifiedBy?: string;

  // Amount paid (important for reconciliation)
  amount: number;

  // Optional: bank transfer reference or narration
  reference?: string;

  // Optional: notes for cash payments or manual comments
  notes?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
