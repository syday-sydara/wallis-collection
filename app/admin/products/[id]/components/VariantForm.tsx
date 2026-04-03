"use client";

import { createVariant } from "../../actions";
import { AdminField } from "@/components/admin/ui/AdminField";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";

export function VariantForm({ productId }) {
  return (
    <form action={createVariant.bind(null, productId)} className="space-y-4">
      <AdminField label="Variant Name">
        <AdminInput name="name" required />
      </AdminField>

      <AdminField label="SKU">
        <AdminInput name="sku" required />
      </AdminField>

      <div className="grid grid-cols-2 gap-4">
        <AdminField label="Price">
          <AdminInput type="number" name="price" step="0.01" min={0} required />
        </AdminField>

        <AdminField label="Initial Stock">
          <AdminInput type="number" name="stock" min={0} required />
        </AdminField>
      </div>

      <SubmitButton type="submit" pendingLabel="Adding variant…">
        Add Variant
      </SubmitButton>
    </form>
  );
}