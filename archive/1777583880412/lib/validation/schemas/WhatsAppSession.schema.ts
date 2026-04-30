// === AUTO-GENERATED START ===
import { z } from "zod";

export const WhatsAppSessionSchema = z.object({
  whatsapp: z.string(),
  state: z.string(),
  data: z.any().optional(),
  updatedAt: z.date(),
  createdAt: z.date(),
});
// === AUTO-GENERATED END ===
