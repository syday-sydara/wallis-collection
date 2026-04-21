"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import admin from "@/lib/admin/client";
import { toast } from "@/components/admin/ui/toast/AdminToastProvider";

export default function NewProductForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    basePrice: 0,
  });

  function handleNameChange(value: string) {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: prev.slug || value.toLowerCase().replace(/\s+/g, "-"),
    }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!form.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    startTransition(async () => {
      try {
        const product = await admin.products.create({
          name: form.name,
          slug: form.slug,
          description: form.description || null,
          basePrice: form.basePrice * 100,
        });

        toast.success("Product created");
        router.push(`/admin/products/${product.id}`);
      } catch {
        toast.error("Failed to create product");
      }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6 max-w-xl">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          className="input w-full"
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Classic T‑Shirt"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <input
          className="input w-full"
          value={form.slug}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, slug: e.target.value }))
          }
          placeholder="e.g. classic-t-shirt"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          className="input w-full min-h-[120px]"
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Optional description"
        />
      </div>

      {/* Base Price */}
      <div>
        <label className="block text-sm font-medium mb-1">Base Price (₦)</label>
        <input
          type="number"
          className="input w-full"
          value={form.basePrice || ""}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              basePrice: Number(e.target.value || 0),
            }))
          }
          min={0}
          step="0.01"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isPending}
        >
          {isPending ? "Creating…" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
