"use server";

import { revalidatePath } from "next/cache";
import { adminUpdateProduct, adminCreateVariant, adminUpdateVariant, adminDeleteVariant, adminAddImage, adminDeleteImage, adminReorderImages, adjustProductStock } from "@/lib/products/admin";

// ------------------------------
// UPDATE PRODUCT
// ------------------------------
export async function updateProduct(productId: string, formData: FormData) {
  try {
    // Get data from FormData and update the product
    await adminUpdateProduct(productId, {
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string | null,
      basePrice: formData.get("basePrice") ? Number(formData.get("basePrice")) : null
    });

    // Revalidate the product path to update UI
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
    // Create a new variant for the product using the form data
    await adminCreateVariant(productId, {
      name: formData.get("name") as string,
      sku: formData.get("sku") as string,
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock"))
    });

    // Revalidate the product page to reflect the newly created variant
    revalidatePath(`/admin/products/${productId}`);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// ------------------------------
// UPDATE VARIANT
// ------------------------------
export async function updateVariant(productId: string, variantId: string, formData: FormData) {
  try {
    // Update an existing variant with the form data
    await adminUpdateVariant(variantId, {
      name: formData.get("name") as string,
      sku: formData.get("sku") as string,
      price: Number(formData.get("price"))
    });

    // Revalidate the product path to reflect the updated variant
    revalidatePath(`/admin/products/${productId}`);
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
    // Delete the variant and revalidate the product path
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

    // Add the image for the product and revalidate the product path
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
    // Delete the image and revalidate the product path
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
    // Reorder images for the product
    await adminReorderImages(productId, newOrder);

    // Revalidate the product path to update the UI
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
    // Adjust stock for a product variant (e.g., increasing or decreasing stock)
    await adjustProductStock({
      variantId: formData.get("variantId") as string,
      change: Number(formData.get("change")),
      reason: (formData.get("reason") as string) ?? undefined
    });

    // Revalidate the product path to reflect stock changes
    revalidatePath(`/admin/products/${productId}`);
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// app/admin/products/actions.ts
"use server";


// ------------------------------
// CREATE PRODUCT
// ------------------------------
export async function createProduct(formData: FormData) {
  try {
    const product = await adminCreateProduct({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string | null,
      basePrice: formData.get("basePrice")
        ? Number(formData.get("basePrice"))
        : null,
      image: formData.get("file") as File | null,  // If you're including an image
    });

    revalidatePath(`/admin/products/${product.id}`);
    return { ok: true, id: product.id };  // Make sure to return the ID of the created product
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}