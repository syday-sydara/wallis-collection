import { z } from "zod";

export const uploadImageSchema = z.object({
  folder: z.string().min(1).default("wallis"),
  maxSizeBytes: z.number().int().positive().default(10 * 1024 * 1024),
  allowedMimeTypes: z
    .array(z.string())
    .default(["image/jpeg", "image/png", "image/webp"]),
});
