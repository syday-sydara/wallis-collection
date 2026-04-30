// === AUTO-GENERATED START ===
import { z } from "zod";

export const WhatsAppMessageLogSchema = z.object({
  id: z.string(),
  to: z.string(),
  operation: z.string(),
  status: z.string(),
  error: z.string().optional(),
  raw: z.any().optional(),
  createdAt: z.date(),
});
// === AUTO-GENERATED END ===
