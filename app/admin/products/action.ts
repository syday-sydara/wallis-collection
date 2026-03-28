"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/* -----------------------------
   HELPERS
----------------------------- */

function formDataToObject(formData: FormData) {
  const obj: Record<string, any> = {};
  formData.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

function fieldError(field: string, message: string) {
  return { ok: false, errors: { [field]: [message] } };
}

function formError(message: string) {
  return { ok: false, errors: { _form: [message] } };
}

/* -----------------------------
   SCHEMAS
----------------------------- */

const productUpdateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  basePrice: z.coerce.number().int().nonnegative(),
  description: z.string().optional(),
  isArchived: z.string().optional() // checkbox
});

const variantCreateSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.coerce.number().int().nonnegative()
});

const inventorySchema = z.object({
  change: z.coerce.number().int(),
  reason: z.string().min(1)
});

/* -----------------------------
   UPDATE PRODUCT
----------------------------- */

export async function updateProduct(productId: string, formData: FormData) {
  const raw = formDataToObject(formData);
  const parsed = productUpdateSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, slug, basePrice, description, isArchived } = parsed.data;

  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        slug,
        basePrice,
        description: description || null,
        isArchived: Boolean(isArchived)
      }
    });

    revalidatePath(`/admin/products/${productId}`);
    return { ok: true };
  } catch (err: any) {
    return formError(err?.message ?? "Failed to update product");
  }
}

/* -----------------------------
   CREATE VARIANT
----------------------------- */

export async function createVariant(productId: string, formData: FormData) {
  const raw = formDataToObject(formData);
  const parsed = variantCreateSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, sku, price } = parsed.data;

  // SKU must be unique across all variants
  const existing = await prisma.productVariant.findUnique({
    where: { sku }
  });

  if (existing) {
    return fieldError("sku", "SKU is already in use");
  }

  try {
    await prisma.productVariant.create({
      data: {
        name,
        sku,
        price,
        productId
      }
    });

    revalidatePath(`/admin/products/${productId}`);
    return { ok: true };
  } catch (err: any) {
    return formError(err?.message ?? "Failed to create variant");
  }
}

/* -----------------------------
   ADJUST INVENTORY
----------------------------- */

export async function adjustInventory(productId: string, formData: FormData) {
  const raw = formDataToObject(formData);
  const parsed = inventorySchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { change, reason } = parsed.data;

  try {
    await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { stock: { increment: change } }
      }),
      prisma.inventoryMovement.create({
        data: {
          productId,
          change,
          reason
        }
      })
    ]);

    revalidatePath(`/admin/products/${productId}`);
    return { ok: true };
  } catch (err: any) {
    return formError(err?.message ?? "Failed to adjust inventory");
  }
}