// lib/env.ts
import { z } from "zod";

/**
 * Centralized, validated environment variables.
 * Ensures type‑safe access across the entire app.
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Public site URL
  NEXT_PUBLIC_SITE_URL: z.string().url(),

  // Redis (optional but recommended)
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Security Center
  SECURITY_PHONE: z.string().optional(), // WhatsApp alerts
  DATA_ENCRYPTION_KEY: z
    .string()
    .length(64, "DATA_ENCRYPTION_KEY must be 32 bytes (64 hex chars)")
    .optional(),

  // WhatsApp provider
  WHATSAPP_ADMIN_NUMBER: z.string().optional(),

  // Webhooks (Stripe, Paddle, etc.)
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  PADDLE_WEBHOOK_SECRET: z.string().optional(),

  // Analytics
  NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),

  // Server port (optional)
  PORT: z.string().optional(),

  // Environment mode
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

/**
 * Parse and export validated environment variables.
 * Throws at startup if any required variable is missing or invalid.
 */
export const env = envSchema.parse(process.env);