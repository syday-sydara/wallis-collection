// lib/core/config.ts

import { z } from "zod";
import { serviceContext } from "./service-context";
import { AppError } from "./errors";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database
  DATABASE_URL: z.string().url(),

  // WhatsApp
  WHATSAPP_ACCESS_TOKEN: z.string().min(1),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1),

  // Optional configs
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  METRICS_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  TRACE_SAMPLING_RATE: z
    .string()
    .optional()
    .transform((v) => Number(v ?? 1)),
});

// Parse + validate
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const ctx = serviceContext.get();

  throw new AppError(
    "CONFIG_VALIDATION_ERROR",
    "Invalid environment variables",
    {
      status: 500,
      meta: {
        issues: parsed.error.format(),
        requestId: ctx.requestId,
        traceId: ctx.traceId,
      },
      operational: false,
    },
  );
}

const env = parsed.data;

/* -------------------------------------------------- */
/* Grouped, typed config                               */
/* -------------------------------------------------- */

export const config = {
  env: env.NODE_ENV,
  isDev: env.NODE_ENV === "development",
  isProd: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",

  db: {
    url: env.DATABASE_URL,
  },

  whatsapp: {
    token: env.WHATSAPP_ACCESS_TOKEN,
    phoneId: env.WHATSAPP_PHONE_NUMBER_ID,
  },

  logging: {
    level: env.LOG_LEVEL,
  },

  metrics: {
    enabled: env.METRICS_ENABLED ?? true,
  },

  tracing: {
    samplingRate: env.TRACE_SAMPLING_RATE ?? 1,
  },

  /**
   * Mask secrets when printing config
   */
  toSafeJSON() {
    return {
      env: this.env,
      db: { url: "[REDACTED]" },
      whatsapp: {
        token: "[REDACTED]",
        phoneId: this.whatsapp.phoneId,
      },
      logging: this.logging,
      metrics: this.metrics,
      tracing: this.tracing,
    };
  },
} as const;
