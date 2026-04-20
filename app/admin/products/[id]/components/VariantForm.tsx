"use client";

import { useState, useTransition } from "react";
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
      className="space-y-6"
    >
      {/* Error */}
      {error && (
        <p className="text-xs text-danger-foreground bg-danger/10 p-2 rounded-md">
          {error}
        </p>
      )}

      {/* MOBILE-FIRST STACKED FIELDS */}
      <div className="flex flex-col gap-4 sm:hidden">
        <AdminField label="Variant Name">
          <AdminInput name="name" required />
        </AdminField>

        <AdminField label="SKU" description="Unique identifier">
          <AdminInput
            name="sku"
            required
            onBlur={(e) => {
              e.target.value = e.target.value.trim().toUpperCase();
            }}
          />
        </AdminField>

        <AdminField label="Price (₦)" description="Price in kobo">
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

      {/* DESKTOP TWO-COLUMN LAYOUT */}
      <div className="hidden sm:grid sm:grid-cols-2 sm:gap-6">
        <AdminField label="Variant Name">
          <AdminInput name="name" required />
        </AdminField>

        <AdminField label="SKU" description="Unique identifier">
          <AdminInput
            name="sku"
            required
            onBlur={(e) => {
              e.target.value = e.target.value.trim().toUpperCase();
            }}
          />
        </AdminField>

        <AdminField label="Price (₦)" description="Price in kobo">
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

      {/* Submit */}
      <SubmitButton type="submit" pendingLabel="Adding variant…">
        Add Variant
      </SubmitButton>
    </form>
  );
}
