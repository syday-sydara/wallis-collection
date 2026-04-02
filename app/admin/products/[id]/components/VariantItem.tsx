"use client";

import { useState, useTransition } from "react";
import { updateVariant, deleteVariant } from "../../actions";

export default function VariantItem({ variant }: { variant: any }) {
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [isPending, startTransition] = useTransition();

  function handleUpdate(formData: FormData) {
    setErrors({});

    startTransition(async () => {
      const result = await updateVariant(variant.id, formData);

      if (!result.ok) {
        setErrors(result.errors ?? {});
      }
    });
  }

  function handleDelete() {
    if (!confirm("Delete this variant?")) return;

    startTransition(async () => {
      await deleteVariant(variant.id);
    });
  }

  return (
    <li className="rounded-md border border-border bg-surface px-3 py-3 text-xs shadow-sm space-y-3">
      {/* UPDATE FORM */}
      <form
        action={handleUpdate}
        className="flex flex-wrap items-start gap-3"
      >
        {/* Name */}
        <div className="flex flex-col">
          <input
            name="name"
            defaultValue={variant.name}
            disabled={isPending}
            className="w-32 rounded-md border border-border bg-surface px-2 py-1.5 text-text 
                       shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus-ring))]"
          />
          {errors.name && (
            <p className="text-danger-foreground text-[11px] mt-1">
              {errors.name[0]}
            </p>
          )}
        </div>

        {/* SKU */}
        <div className="flex flex-col">
          <input
            name="sku"
            defaultValue={variant.sku}
            disabled={isPending}
            className="w-32 rounded-md border border-border bg-surface px-2 py-1.5 text-text 
                       shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus-ring))]"
          />
          {errors.sku && (
            <p className="text-danger-foreground text-[11px] mt-1">
              {errors.sku[0]}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="flex flex-col">
          <input
            name="price"
            type="number"
            defaultValue={variant.price}
            disabled={isPending}
            className="w-28 rounded-md border border-border bg-surface px-2 py-1.5 text-text 
                       shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus-ring))]"
          />
          {errors.price && (
            <p className="text-danger-foreground text-[11px] mt-1">
              {errors.price[0]}
            </p>
          )}
        </div>

        {/* Save button */}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground 
                     shadow-sm hover:bg-primary-hover active:bg-primary-active disabled:opacity-60 transition-all"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </form>

      {/* FORM-LEVEL ERROR */}
      {errors._form && (
        <p className="text-danger-foreground text-[11px]">{errors._form[0]}</p>
      )}

      {/* DELETE BUTTON */}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-[11px] text-danger-foreground hover:underline disabled:opacity-50"
      >
        Delete
      </button>
    </li>
  );
}