export interface InventoryItem {
  variantId: string;

  // Current stock level
  stockQty: number;

  // Optional: minimum stock before triggering alerts
  reorderLevel?: number;

  // Optional: warehouse or location (useful if you expand later)
  location?: string;

  // Optional: notes for adjustments or manual corrections
  notes?: string;

  // Timestamps
  updatedAt: string;
}
