// lib/env.ts
import { z } from "zod";

export const env = z.object({
  DATABASE_URL: z.string(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
}).parse(process.env);