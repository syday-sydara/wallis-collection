"use client";

import { useRef, useTransition } from "react";
import { updateInventory } from "../../actions";
import { AdminField } from "@/components/admin/ui/AdminField";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";
import { AdminCard } from "@/components/admin/ui/AdminCard";

export function InventorySection({ productId, variants }) {
  return (
    <div className="space-y-6">
      {variants.map((v) => (
        <VariantStockForm key={v.id} productId={productId} variant={v} />
      ))}
    </div>
  );
}

function VariantStockForm({ productId, variant }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef(null);

  return (
    <AdminCard>
      <form
        ref={formRef}
        action={(formData) => {
          startTransition(async () => {
            await updateInventory(productId, formData);
            formRef.current?.reset();
          });
        }}
        className="space-y-4"
      >
        <p className="font-medium">{variant.name}</p>
        <p className="text-xs text-text-muted">
          Current stock: {variant.stock}
        </p>

        <input type="hidden" name="variantId" value={variant.id} />

        <AdminField label="Change Amount">
          <AdminInput type="number" name="change" required step="1" />
        </AdminField>

        <AdminField label="Reason">
          <AdminInput name="reason" />
        </AdminField>

        <SubmitButton type="submit" pendingLabel="Updating stock…">
          Apply
        </SubmitButton>
      </form>
    </AdminCard>
  );
}