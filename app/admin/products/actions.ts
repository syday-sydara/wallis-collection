"use server";

import { adminCreateProduct } from "@/lib/products/admin";
import { uploadImageFromFormData } from "@/lib/cloudinary/";

export async function createProduct(formData: FormData) {
  try {
    const name = formData.get("name")?.toString() ?? "";
    const slug = formData.get("slug")?.toString() ?? "";
    const description = formData.get("description")?.toString() ?? null;
    const basePriceRaw = formData.get("basePrice")?.toString() ?? "";
    const file = formData.get("file") as File | null;

    const errors: Record<string, string[]> = {};

    if (!name) errors.name = ["Name is required"];
    if (!slug) errors.slug = ["Slug is required"];
    if (!basePriceRaw) errors.basePrice = ["Base price is required"];

    const basePrice = Number(basePriceRaw);
    if (isNaN(basePrice)) {
      errors.basePrice = ["Base price must be a number"];
    }

    if (Object.keys(errors).length > 0) {
      return { ok: false, errors };
    }

    let uploadedUrl: string | null = null;

    if (file && file.size > 0) {
      uploadedUrl = await uploadImageFromFormData(file);
    }

    const product = await adminCreateProduct({
      name,
      slug,
      description,
      basePrice,
      image: uploadedUrl ? file : null, // adminCreateProduct expects File | null
    });

    return { ok: true, id: product.id };
  } catch (err) {
    console.error("Create product failed:", err);
    return {
      ok: false,
      errors: { _form: ["Something went wrong while creating the product"] },
    };
  }
}
