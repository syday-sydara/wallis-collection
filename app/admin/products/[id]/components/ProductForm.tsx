"use client";

import { useState, useTransition } from "react";
import { updateProduct } from "../../actions";
import { AdminField } from "@/components/admin/ui/AdminField";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import { AdminTextarea } from "@/components/admin/ui/AdminTextarea";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";

export function ProductForm({ product }) {
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const result = await updateProduct(product.id, formData);
          if (!result.ok) setError(result.error);
        });
      }}
      className="space-y-6"
    >
      <AdminField label="Name">
        <AdminInput name="name" defaultValue={product.name} required />
      </AdminField>

      <AdminField label="Slug" description="Used in the product URL.">
        <AdminInput
          name="slug"
          defaultValue={product.slug}
          required
          onBlur={(e) => {
            e.target.value = e.target.value
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");
          }}
        />
      </AdminField>

      <AdminField label="Base Price" description="Price in kobo">
        <AdminInput
          type="number"
          name="basePrice"
          defaultValue={product.basePrice ?? ""}
          step="1"
          min="0"
        />
      </AdminField>

      <AdminField label="Description">
        <AdminTextarea
          name="description"
          defaultValue={product.description ?? ""}
          rows={4}
        />
      </AdminField>

      {error && (
        <p className="text-xs text-danger-foreground">{error}</p>
      )}

      <SubmitButton type="submit" pendingLabel="Saving product…">
        Save Changes
      </SubmitButton>
    </form>
  );
}