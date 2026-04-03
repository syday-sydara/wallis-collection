"use client";

import { useState, useTransition } from "react";
import { updateVariant, deleteVariant } from "../../actions";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminField } from "@/components/admin/ui/AdminField";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";

export function VariantList({ variants, productId }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3">
      {variants.map((variant) => {
        const isEditing = editing === variant.id;

        return (
          <AdminCard key={variant.id}>
            {isEditing ? (
              <form
                className="space-y-4"
                action={updateVariant.bind(null, productId, variant.id)}
                onSubmit={() => setEditing(null)}
              >
                <AdminField label="Name">
                  <AdminInput name="name" defaultValue={variant.name} />
                </AdminField>

                <AdminField label="SKU">
                  <AdminInput name="sku" defaultValue={variant.sku} />
                </AdminField>

                <AdminField label="Price">
                  <AdminInput
                    type="number"
                    name="price"
                    step="0.01"
                    min={0}
                    defaultValue={variant.price}
                  />
                </AdminField>

                <div className="flex gap-2">
                  <SubmitButton type="submit" size="sm" pendingLabel="Saving…">
                    Save
                  </SubmitButton>

                  <button
                    type="button"
                    className="text-xs text-text-muted"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{variant.name}</p>
                  <p className="text-xs text-text-muted">SKU: {variant.sku}</p>
                  <p className="text-xs text-text-muted">
                    ${variant.price.toFixed(2)} — {variant.stock} in stock
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    className="text-xs underline"
                    onClick={(e) => {
                      e.preventDefault();
                      setEditing(variant.id);
                    }}
                  >
                    Edit
                  </button>

                  <form action={deleteVariant.bind(null, variant.id, productId)}>
                    <SubmitButton
                      variant="danger"
                      size="sm"
                      pendingLabel="Deleting…"
                    >
                      Delete
                    </SubmitButton>
                  </form>
                </div>
              </div>
            )}
          </AdminCard>
        );
      })}
    </div>
  );
}