"use client";

import { useState, useTransition } from "react";
import { updateVariant, deleteVariant } from "../action";

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
    <li className="rounded border p-2 text-xs space-y-2">
      {/* UPDATE FORM */}
      <form action={handleUpdate} className="flex flex-wrap items-center gap-2">
        <div>
          <input
            name="name"
            defaultValue={variant.name}
            disabled={isPending}
            className="w-32 rounded border px-2 py-1"
          />
          {errors.name && (
            <p className="text-red-600 text-[11px]">{errors.name[0]}</p>
          )}
        </div>

        <div>
          <input
            name="sku"
            defaultValue={variant.sku}
            disabled={isPending}
            className="w-32 rounded border px-2 py-1"
          />
          {errors.sku && (
            <p className="text-red-600 text-[11px]">{errors.sku[0]}</p>
          )}
        </div>

        <div>
          <input
            name="price"
            type="number"
            defaultValue={variant.price}
            disabled={isPending}
            className="w-28 rounded border px-2 py-1"
          />
          {errors.price && (
            <p className="text-red-600 text-[11px]">{errors.price[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-neutral-900 px-2 py-1 text-[11px] font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </form>

      {/* FORM-LEVEL ERROR */}
      {errors._form && (
        <p className="text-red-600 text-[11px]">{errors._form[0]}</p>
      )}

      {/* DELETE BUTTON */}
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-[11px] text-red-600 hover:underline disabled:opacity-50"
      >
        Delete
      </button>
    </li>
  );
}