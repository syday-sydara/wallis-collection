export interface Customer {
  id: string;

  // Full name of the customer
  name: string;

  // Nigerian phone number (validated by Zod or service layer)
  phoneNumber: string;

  // Optional: email for future expansion
  email?: string | null;

  // Optional: notes (e.g., delivery instructions, VIP status)
  notes?: string | null;

  // Optional: number of orders (useful for admin dashboards)
  orderCount?: number;

  // ISO timestamps
  createdAt: string;
  updatedAt: string;
}
