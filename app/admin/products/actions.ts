// app/admin/products/actions.ts
"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/* ------------------------- ZOD SCHEMAS ------------------------- */

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  basePrice: z.coerce.number().int().nonnegative(),
  description: z.string().optional(),
  isArchived: z.coerce.boolean().optional()
});

const variantSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.coerce.number().int().nonnegative()
});

const variantUpdateSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.coerce.number().int().nonnegative()
});

const inventorySchema = z.object({
  change: z.coerce.number().int(),
  reason: z.string().min(1)
});

const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional()
});

/* ------------------------- HELPERS ------------------------- */

function formDataToObject(formData: FormData) {
  const obj: Record<string, any> = {};
  formData.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

/* ------------------------- PRODUCT ACTIONS ------------------------- */

export async function createProduct(formData: FormData) {
  const raw = formDataToObject(formData);
  const parsed = productSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, slug, basePrice, description } = parsed.data;

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    return { ok: false, errors: { slug: ["Slug is already in use"] } };
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      basePrice,
      description: description || null
    }
  });

  revalidatePath("/admin/products");
  return { ok: true, id: product.id };
}

export async function updateProduct(id: string, formData: FormData) {
  const raw = formDataToObject(formData);
  const parsed = productSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, slug, basePrice, description, isArchived } = parsed.data;

  const existing = await prisma.product.findFirst({
    where: { slug, NOT: { id } }
  });

  if (existing) {
    return { ok: false, errors: { slug: ["Slug is already in use"] } };
  }

  await prisma.product.update({
    where: { id },
    data: {
      name,
      slug,
      basePrice,
      description: description || null,
      isArchived: !!isArchived
    }
  });

  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/admin/products");

  return { ok: true };
}

/* ------------------------- VARIANT ACTIONS ------------------------- */

export async function createVariant(productId: string, formData: FormData) {
  const raw = formDataToObject(formData);
  const parsed = variantSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, sku, price } = parsed.data;

  const existing = await prisma.productVariant.findUnique({ where: { sku } });
  if (existing) {
    return { ok: false, errors: { sku: ["SKU is already in use"] } };
  }

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
}

export async function updateVariant(variantId: string, formData: FormData) {
  const raw = formDataToObject(formData);
  const parsed = variantUpdateSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, sku, price } = parsed.data;

  const existing = await prisma.productVariant.findFirst({
    where: { sku, NOT: { id: variantId } }
  });

  if (existing) {
    return { ok: false, errors: { sku: ["SKU is already in use"] } };
  }

  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    include: { product: true },
    data: { name, sku, price }
  });

  revalidatePath(`/admin/products/${variant.productId}`);
  return { ok: true };
}

export async function deleteVariant(variantId: string) {
  const variant = await prisma.productVariant.delete({
    where: { id: variantId },
    include: { product: true }
  });

  revalidatePath(`/admin/products/${variant.productId}`);
  return { ok: true };
}

/* ------------------------- INVENTORY ACTIONS ------------------------- */

export async function adjustInventory(productId: string, formData: FormData) {
  const raw = formDataToObject(formData);
  const parsed = inventorySchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { change, reason } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const current = await tx.product.findUnique({
        where: { id: productId },
        select: { stock: true }
      });

      if (!current) throw new Error("Product not found");

      const newStock = current.stock + change;
      if (newStock < 0) throw new Error("Stock cannot be negative");

      await tx.product.update({
        where: { id: productId },
        data: { stock: newStock }
      });

      await tx.inventoryMovement.create({
        data: { productId, change, reason }
      });
    });

    revalidatePath(`/admin/products/${productId}`);
    return { ok: true };
  } catch (err: any) {
    return {
      ok: false,
      errors: { _form: [err?.message ?? "Inventory adjustment failed"] }
    };
  }
}

/* ------------------------- IMAGE ACTIONS ------------------------- */

export async function addProductImage(productId: string, formData: FormData) {
  const raw = formDataToObject(formData);
  const parsed = imageSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { url, alt } = parsed.data;

  await prisma.productImage.create({
    data: {
      url,
      alt: alt || null,
      productId
    }
  });

  revalidatePath(`/admin/products/${productId}`);
  return { ok: true };
}

export async function deleteProductImage(imageId: string) {
  const img = await prisma.productImage.delete({
    where: { id: imageId },
    include: { product: true }
  });

  revalidatePath(`/admin/products/${img.productId}`);
  return { ok: true };
}

export async function reorderProductImages(productId: string, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.productImage.update({
        where: { id },
        data: { sortOrder: index }
      })
    )
  );

  revalidatePath(`/admin/products/${productId}`);
  return { ok: true };
}