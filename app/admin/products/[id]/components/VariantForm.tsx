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

      <AdminField label="Price">
        <AdminInput type="number" name="price" step="0.01" required />
      </AdminField>

      <AdminField label="Initial Stock">
        <AdminInput type="number" name="stock" required />
      </AdminField>

      <SubmitButton pendingLabel="Adding variant…">Add Variant</SubmitButton>
    </form>
  );
}