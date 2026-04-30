// === AUTO-GENERATED START ===
import { z } from "zod";

export const StockLogSchema = z.object({
  id: z.string(),
  variantId: z.string(),
  variant: z.string(),
  change: z.number(),
  reason: z.string(),
  createdAt: z.date(),
});
// === AUTO-GENERATED END ===
