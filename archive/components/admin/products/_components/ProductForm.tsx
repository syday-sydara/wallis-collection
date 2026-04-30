"use client";

import { useTransition } from "react";
import { toast } from "@/app/ui/toast/AdminToastProvider";

export function ProductForm({ product, action }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          const result = await action(formData);

          if (result?.error) {
            toast.error("Failed to update product");
          } else {
            toast.success("Product updated");
          }
        });
      }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Name</label>
        <input
          name="name"
          defaultValue={product.name}
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Slug</label>
        <input
          name="slug"
          defaultValue={product.slug}
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Base Price</label>
        <input
          name="basePrice"
          type="number"
          defaultValue={product.basePrice}
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Stock</label>
        <input
          name="stock"
          type="number"
          defaultValue={product.stock}
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-2 md:col-span-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          name="description"
          defaultValue={product.description ?? ""}
          rows={4}
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="md:col-span-2 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-black text-white rounded"
        >
          {isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
