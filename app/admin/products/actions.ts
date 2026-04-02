"use server";

import { revalidatePath } from "next/cache";
import { updateProduct } from '@/app/admin/products/actions';
import {
  updateProduct,
  createVariant,
  updateVariant,
  deleteVariant,
  addImage,
  deleteImage,
  reorderImages,
  adjustProductStock
} from "@/lib/catalog/admin";

// ------------------------------
// UPDATE PRODUCT
// ------------------------------
export async function updateProduct(productId: string, formData: FormData) {
  try {
    await adminUpdateProduct(productId, {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string | null,
      basePrice: formData.get("basePrice")
        ? Number(formData.get("basePrice"))
        : null
    });

    revalidatePath(`/admin/products/${productId}`);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// ------------------------------
// CREATE VARIANT
// ------------------------------
export async function createVariant(productId: string, formData: FormData) {
  try {
    await adminCreateVariant(productId, {
      name: formData.get("name") as string,
      sku: formData.get("sku") as string,
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock"))
    });

    revalidatePath(`/admin/products/${productId}`);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// ------------------------------
// UPDATE VARIANT
// ------------------------------
export async function updateVariant(variantId: string, formData: FormData) {
  try {
    await adminUpdateVariant(variantId, {
      name: formData.get("name") as string,
      sku: formData.get("sku") as string,
      price: Number(formData.get("price"))
    });

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// ------------------------------
// DELETE VARIANT
// ------------------------------
export async function deleteVariant(variantId: string, productId: string) {
  try {
    await adminDeleteVariant(variantId);
    revalidatePath(`/admin/products/${productId}`);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// ------------------------------
// ADD IMAGE
// ------------------------------
export async function addImage(productId: string, formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const alt = formData.get("alt") as string | null;

    await adminAddImage(productId, file, alt);

    revalidatePath(`/admin/products/${productId}`);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// ------------------------------
// DELETE IMAGE
// ------------------------------
export async function deleteImage(productId: string, imageId: string) {
  try {
    await adminDeleteImage(imageId);
    revalidatePath(`/admin/products/${productId}`);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// ------------------------------
// REORDER IMAGES
// ------------------------------
export async function reorderImages(productId: string, newOrder: string[]) {
  try {
    await adminReorderImages(productId, newOrder);
    revalidatePath(`/admin/products/${productId}`);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// ------------------------------
// ADJUST STOCK
// ------------------------------
export async function updateInventory(productId: string, formData: FormData) {
  try {
    await adjustProductStock({
      variantId: formData.get("variantId") as string,
      change: Number(formData.get("change")),
      reason: (formData.get("reason") as string) ?? undefined
    });

    revalidatePath(`/admin/products/${productId}`);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}