"use client";

import { useState, useTransition } from "react";
import admin from "@/lib/admin/client";
import { toast } from "@/components/admin/ui/toast/AdminToastProvider";

export default function GeneralTab({ product }) {
  const [form, setForm] = useState({
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    basePrice: product.basePrice,
  });

  const [isPending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        await admin.products.update(product.id, form);
        toast.success("Product updated");
      } catch {
        toast.error("Failed to update product");
      }
    });
  }

  return (
    <div className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          className="input"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <input
          className="input"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="input min-h-[120px]"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Base Price (₦)</label>
        <input
          type="number"
          className="input"
          value={form.basePrice / 100}
          onChange={(e) =>
            setForm({ ...form, basePrice: Number(e.target.value) * 100 })
          }
        />
      </div>

      <button
        onClick={save}
        disabled={isPending}
        className="btn btn-primary"
      >
        {isPending ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
