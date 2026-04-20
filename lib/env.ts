// lib/env.ts
import { z } from "zod";

const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    NEXT_PUBLIC_SITE_URL: z
      .string()
      .url()
      .refine(
        (url) =>
          process.env.NODE_ENV !== "production" || url.startsWith("https://"),
        "NEXT_PUBLIC_SITE_URL must use https in production"
      ),

    // Redis
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // Security Center
    SECURITY_PHONE: z.string().optional(),
    DATA_ENCRYPTION_KEY: z
      .string()
      .regex(/^[0-9a-fA-F]{64}$/, "Must be 32‑byte hex string")
      .optional(),

    WHATSAPP_ADMIN_NUMBER: z.string().optional(),

    // Webhooks
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
    PADDLE_WEBHOOK_SECRET: z.string().min(1).optional(),

    // Analytics
    NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),

    PORT: z.string().optional(),

    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    APP_ENV: z.enum(["local", "dev", "staging", "production"]).default("local"),
  })
  .superRefine((env, ctx) => {
    const hasRedisUrl = !!env.UPSTASH_REDIS_REST_URL;
    const hasRedisToken = !!env.UPSTASH_REDIS_REST_TOKEN;

    if (hasRedisUrl !== hasRedisToken) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Both Redis URL and token must be provided together",
        path: ["UPSTASH_REDIS_REST_URL"],
      });
    }
  });

export const env = envSchema.parse(process.env);
