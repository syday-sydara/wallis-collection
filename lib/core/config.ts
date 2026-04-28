// lib/core/config.ts

import { z } from "zod";

const schema = z.object({
  WHATSAPP_ACCESS_TOKEN: z.string().min(1),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

export const config = schema.parse(process.env);
