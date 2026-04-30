import { z } from "zod";

export const cartSchema = z.object({
  id: z.string().optional(),

  userId: z.string(),
  sessionId: z.string().nullable().optional(),
});
