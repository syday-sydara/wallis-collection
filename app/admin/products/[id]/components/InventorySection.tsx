"use client";

import { updateInventory } from "../../actions";
import { AdminField } from "@/components/admin/ui/AdminField";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";

export function InventorySection({ productId, variants }) {
  return (
    <div className="space-y-6">
      {variants.map((v) => (
        <form
          key={v.id}
          action={updateInventory.bind(null, productId)}
          className="space-y-4 border rounded p-4"
        >
          <p className="font-medium">{v.name}</p>
          <p className="text-xs text-text-muted">Current stock: {v.stock}</p>

          <input type="hidden" name="variantId" value={v.id} />

          <AdminField label="Change Amount">
            <AdminInput type="number" name="change" required />
          </AdminField>

          <AdminField label="Reason">
            <AdminInput name="reason" />
          </AdminField>

          <SubmitButton pendingLabel="Updating stock…">Apply</SubmitButton>
        </form>
      ))}
    </div>
  );
}