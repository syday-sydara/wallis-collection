"use client";

import { useState, useTransition } from "react";
import { updateVariant, deleteVariant } from "@/app/admin/products/actions";

import { AdminField } from "@/components/admin/ui/AdminField";
import { AdminInput } from "@/components/admin/ui/AdminInput";
import { AdminButton } from "@/components/admin/ui/AdminButton";

export default function VariantItem({ variant }: { variant: any }) {
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [isPending, startTransition] = useTransition();

  function handleUpdate(formData: FormData) {
    setErrors({});

    startTransition(async () => {
      const result = await updateVariant(variant.id, formData);
      if (!result.ok) setErrors(result.errors ?? {});
    });
  }

  function handleDelete() {
    if (!confirm("Delete this variant?")) return;

    startTransition(async () => {
      await deleteVariant(variant.id);
    });
  }

  return (
    <li className="rounded-md border border-border bg-surface p-3 shadow-sm space-y-3 text-xs">
      {/* UPDATE FORM */}
      <form action={handleUpdate} className="flex flex-wrap items-start gap-3">
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
          />
        </AdminField>

        <AdminField label="Price" error={errors.price?.[0]}>
          <AdminInput
            name="price"
            type="number"
            defaultValue={variant.price}
            disabled={isPending}
          />
        </AdminField>

        <AdminButton
          type="submit"
          disabled={isPending}
          className="px-3 py-1.5"
        >
          {isPending ? "Saving…" : "Save"}
        </AdminButton>
      </form>

      {/* FORM-LEVEL ERROR */}
      {errors._form && (
        <p className="text-danger-foreground text-[11px]">
          {errors._form[0]}
        </p>
      )}

      {/* DELETE BUTTON */}
      <AdminButton
        variant="danger"
        onClick={handleDelete}
        disabled={isPending}
        className="text-[11px] px-2 py-1"
      >
        Delete
      </AdminButton>
    </li>
  );
}