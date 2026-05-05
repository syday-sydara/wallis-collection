import { z } from "zod";

export const DLQEntrySchema = z.object({
  id: z.string(),
  failedAt: z.string().datetime(),
  reason: z.string(),
  payload: z.any(),
});

export const DLQListSchema = z.array(DLQEntrySchema);

export type DLQEntry = z.infer<typeof DLQEntrySchema>;
export type DLQList = z.infer<typeof DLQListSchema>;
