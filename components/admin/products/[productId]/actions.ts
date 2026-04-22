"use server";

import { prisma } from "@/lib/prisma";
import { updateProductSchema } from "@/lib/products/validation";
import { revalidatePath } from "next/cache";

export async function updateProductAction(productId: string, formData: FormData) {
  try {
    const parsed = updateProductSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      basePrice: formData.get("basePrice"),
      stock: formData.get("stock"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      return {
        error: parsed.error.flatten().fieldErrors,
      };
    }

    const data = parsed.data;

    await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        slug: data.slug,
        basePrice: data.basePrice,
        stock: data.stock,
        description: data.description,
      },
    });

    revalidatePath(`/admin/products/${productId}`);

    return { success: true };
  } catch (err) {
    console.error("Failed to update product:", err);
    return { error: "Something went wrong" };
  }
}
