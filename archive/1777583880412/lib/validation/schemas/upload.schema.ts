import { z } from "zod";

export const uploadImageSchema = z.object({
  folder: z.string().default("wallis"),
  maxSizeBytes: z.number().default(10 * 1024 * 1024),
  allowedMimeTypes: z
    .array(z.string())
    .default(["image/jpeg", "image/png", "image/webp"]),
});
