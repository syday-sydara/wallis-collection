export interface InventoryItem {
  variantId: string;

  // Current stock level
  stockQty: number;

  // Optional: minimum stock before triggering alerts
  reorderLevel?: number | null;

  // Optional: warehouse or location (future multi‑warehouse support)
  location?: string | null;

  // Optional: notes for adjustments or manual corrections
  notes?: string | null;

  // ISO timestamp
  updatedAt: string;
}
