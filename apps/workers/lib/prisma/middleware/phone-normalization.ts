// lib/prisma/middleware/phone-normalization.ts
import type { Prisma } from "@prisma/client";
import { normalizePhone } from "@/utils/phone";

const TARGET_MODELS = new Set([
  "Customer",
  "Order",
  "WhatsAppOrder",
]);

export function phoneNormalizationMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    // Only normalize for specific models
    if (!TARGET_MODELS.has(params.model)) {
      return next(params);
    }

    // Normalize for create, update, upsert
    if (params.action === "create" || params.action === "update") {
      params.args.data = normalizeData(params.args.data);
    }

    if (params.action === "upsert") {
      if (params.args.create) {
        params.args.create = normalizeData(params.args.create);
      }
      if (params.args.update) {
        params.args.update = normalizeData(params.args.update);
      }
    }

    return next(params);
  };
}

// ------------------------------------------------------
// Normalize phone fields (supports nested writes)
// ------------------------------------------------------
function normalizeData(data: any): any {
  if (!data || typeof data !== "object") return data;

  const clone = { ...data };

  // Normalize phoneNumber
  if (clone.phoneNumber) {
    const normalized = normalizePhone(clone.phoneNumber);
    if (!normalized) throw new Error("Invalid phone number");

    clone.phoneNumber = normalized;
    clone.phoneNormalized = normalized;
  }

  // Normalize phoneNormalized if provided directly
  if (clone.phoneNormalized) {
    const normalized = normalizePhone(clone.phoneNormalized);
    if (!normalized) throw new Error("Invalid phoneNormalized value");

    clone.phoneNormalized = normalized;
  }

  // Recursively normalize nested writes
  for (const key of Object.keys(clone)) {
    const value = clone[key];

    // Nested create/update
    if (value && typeof value === "object") {
      if (value.create) value.create = normalizeData(value.create);
      if (value.update) value.update = normalizeData(value.update);

      // Nested array create
      if (Array.isArray(value.create)) {
        value.create = value.create.map((v) => normalizeData(v));
      }
    }
  }

  return clone;
}
