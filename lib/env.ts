// lib/env.ts
import { z } from "zod";

/**
 * Define and validate environment variables at startup.
 * Ensures type‑safe access throughout the app.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL"),

  // Optional server port (useful for custom Node servers)
  PORT: z.string().optional(),

  // Standardized environment mode
  NODE_ENV: z.enum(["development", "production", "test"]).default("development")
});

/**
 * Parse and export validated environment variables.
 * Throws at startup if any required variable is missing or invalid.
 */
export const env = envSchema.parse(process.env);
