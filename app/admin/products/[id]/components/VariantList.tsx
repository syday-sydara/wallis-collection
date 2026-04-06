"use client";

import { useState, useTransition } from "react";
import { updateVariant, deleteVariant } from "../../actions";
import { AdminCard } from "@/components/admin/ui/AdminCard";
import { AdminField } from "@/components/admin/ui/AdminField";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import { SubmitButton } from "@/components/admin/ui/SubmitButton";

export function VariantList({ variants, productId }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
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
                action={async (formData) => {
                  setErrors({});
                  startTransition(async () => {
                    const result = await updateVariant(productId, variant.id, formData);
                    if (!result.ok) {
                      setErrors(result.errors ?? {});
                    } else {
                      setEditing(null);
                    }
                  });
                }}
              >
                <AdminField label="Name" error={errors.name?.[0]}>
                  <AdminInput
                    name="name"
                    defaultValue={variant.name}
                    disabled={isPending}
                  />
                </AdminField>

                <AdminField label="SKU" error={errors.sku?.[0]}>
                  <AdminInput
                    name="sku"
                    defaultValue={variant.sku}
                    disabled={isPending}
                    onBlur={(e) => {
                      e.target.value = e.target.value.trim().toUpperCase();
                    }}
                  />
                </AdminField>

                <AdminField label="Price" error={errors.price?.[0]}>
                  <AdminInput
                    name="price"
                    type="number"
                    min={0}
                    step="0.01"
                    defaultValue={variant.price}
                    disabled={isPending}
                  />
                </AdminField>

                {errors._form && (
                  <p className="text-danger-foreground text-[11px]">
                    {errors._form[0]}
                  </p>
                )}

                <div className="flex gap-2">
                  <SubmitButton type="submit" size="sm" pendingLabel="Saving…">
                    Save
                  </SubmitButton>

                  <button
                    type="button"
                    className="text-xs text-text-muted"
                    disabled={isPending}
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
                    disabled={isPending}
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
                      disabled={isPending}
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