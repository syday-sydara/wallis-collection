"use client";

import { updateProduct } from "../../actions";
import { AdminField } from "@/components/admin/ui/AdminField";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import { AdminTextarea } from "@/components/admin/ui/AdminTextarea";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";

export function ProductForm({ product }) {
  return (
    <form action={updateProduct.bind(null, product.id)} className="space-y-6">
      <AdminField label="Name">
        <AdminInput name="name" defaultValue={product.name} required />
      </AdminField>

      <AdminField label="Slug" description="Used in the product URL.">
        <AdminInput name="slug" defaultValue={product.slug} required />
      </AdminField>

      <AdminField label="Base Price">
        <AdminInput
          type="number"
          name="basePrice"
          defaultValue={product.basePrice ?? ""}
          step="0.01"
        />
      </AdminField>

      <AdminField label="Description">
        <AdminTextarea
          name="description"
          defaultValue={product.description ?? ""}
          rows={4}
        />
      </AdminField>

      <SubmitButton type="submit" pendingLabel="Saving product…">
        Save Changes
      </SubmitButton>
    </form>
  );
}