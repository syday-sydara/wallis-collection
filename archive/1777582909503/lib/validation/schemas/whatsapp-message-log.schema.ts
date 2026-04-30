import { z } from "zod";

export const whatsappMessageLogSchema = z.object({
  id: z.string().optional(),

  to: z.string(),
  operation: z.string(),
  status: z.string(),
  error: z.string().nullable().optional(),
  raw: z.any().optional(),
});
