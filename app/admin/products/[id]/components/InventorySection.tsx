"use client";

import { updateInventory } from "../../actions";
import { AdminField } from "@/components/admin/ui/AdminField";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";
import { AdminCard } from "@/components/admin/ui/AdminCard";

export function InventorySection({ productId, variants }) {
  return (
    <div className="space-y-6">
      {variants.map((v) => (
        <AdminCard key={v.id}>
          <form
            action={updateInventory.bind(null, productId)}
            className="space-y-4"
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

            <SubmitButton type="submit" pendingLabel="Updating stock…">
              Apply
            </SubmitButton>
          </form>
        </AdminCard>
      ))}
    </div>
  );
}