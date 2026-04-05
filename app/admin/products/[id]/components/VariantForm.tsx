"use client";

import { useState, useTransition } from "react";
import { createVariant } from "../../actions";
import { AdminField } from "@/components/admin/ui/AdminField";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";

export function VariantForm({ productId }) {
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const result = await createVariant(productId, formData);
          if (!result.ok) setError(result.error);
        });
      }}
      className="space-y-4"
    >
      <AdminField label="Variant Name">
        <AdminInput name="name" required />
      </AdminField>

      <AdminField label="SKU" description="Unique identifier for this variant">
        <AdminInput
          name="sku"
          required
          onBlur={(e) => {
            e.target.value = e.target.value.trim().toUpperCase();
          }}
        />
      </AdminField>

      <div className="grid grid-cols-2 gap-4">
        <AdminField label="Price" description="Price in kobo">
          <AdminInput
            type="number"
            name="price"
            step="0.01"
            min={0}
            required
          />
        </AdminField>

        <AdminField label="Initial Stock">
          <AdminInput
            type="number"
            name="stock"
            min={0}
            step="1"
            required
          />
        </AdminField>
      </div>

      {error && (
        <p className="text-xs text-danger-foreground">{error}</p>
      )}

      <SubmitButton type="submit" pendingLabel="Adding variant…">
        Add Variant
      </SubmitButton>
    </form>
  );
}