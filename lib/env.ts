// lib/env.ts
import { z } from "zod";

/**
 * Define environment variables and their types
 * - Validates at startup
 * - Provides type-safe access throughout the app
 */
export const env = z
  .object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    NEXT_PUBLIC_SITE_URL: z.string().url("NEXT_PUBLIC_SITE_URL must be a valid URL"),
    PORT: z.string().optional(), // optional for custom server port
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  })
  .parse(process.env);