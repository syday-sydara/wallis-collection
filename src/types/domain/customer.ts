export interface Customer {
  id: string;

  // Full name of the customer
  name: string;

  // Nigerian phone number (validated elsewhere)
  phoneNumber: string;

  // Optional: email for future expansion
  email?: string;

  // Optional: notes (e.g., delivery instructions, VIP status)
  notes?: string;

  // Optional: number of orders (useful for admin dashboards)
  orderCount?: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
