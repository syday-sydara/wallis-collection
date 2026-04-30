import { z } from "zod";

export const whatsappSessionSchema = z.object({
  whatsapp: z.string(),
  state: z.string(),
  data: z.any().optional(),
});
