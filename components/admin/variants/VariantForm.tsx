"use client";

import { useState, useTransition } from "react";
import admin from "@/lib/admin/client";
import { toast } from "@/components/admin/ui/toast/AdminToastProvider";
import { useModal } from "@/components/admin/ui/modal/AdminModalController";
import { AdminModalHeader } from "@/components/admin/ui/modal/AdminModalHeader";
import { AdminModalFooter } from "@/components/admin/ui/modal/AdminModalFooter";

export default function VariantForm({
  productId,
  variant,
}: {
  productId: string;
  variant?: any;
}) {
  const modal = useModal();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: variant?.name || "",
    price: variant ? variant.price / 100 : 0,
    sku: variant?.sku || "",
    stock: variant?.stock || 0,
  });

  function save() {
    startTransition(async () => {
      try {
        if (variant) {
          // Update existing variant
          await admin.products.variants.update(productId, variant.id, {
            name: form.name,
            price: form.price * 100,
            sku: form.sku,
            stock: form.stock,
          });

          toast.success("Variant updated");
        } else {
          // Create new variant
          await admin.products.variants.create(productId, {
            name: form.name,
            price: form.price * 100,
            sku: form.sku,
            stock: form.stock,
          });

          toast.success("Variant created");
        }

        modal.close();
        location.reload();
      } catch {
        toast.error("Failed to save variant");
      }
    });
  }

  function deleteVariant() {
    if (!variant) return;

    startTransition(async () => {
      try {
        await admin.products.variants.delete(productId, variant.id);
        toast.success("Variant deleted");
        modal.close();
        location.reload();
      } catch {
        toast.error("Failed to delete variant");
      }
    });
  }

  return (
    <div className="space-y-4">
      <AdminModalHeader title={variant ? "Edit Variant" : "New Variant"} />

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          className="input w-full"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>

      {/* Price */}
      <div>
        <label className="block text-sm font-medium mb-1">Price (₦)</label>
        <input
          type="number"
          className="input w-full"
          value={form.price}
          onChange={(e) =>
            setForm({ ...form, price: Number(e.target.value) })
          }
        />
      </div>

      {/* SKU */}
      <div>
        <label className="block text-sm font-medium mb-1">SKU (optional)</label>
        <input
          className="input w-full"
          value={form.sku}
          onChange={(e) => setForm({ ...form, sku: e.target.value })}
        />
      </div>

      {/* Stock */}
      <div>
        <label className="block text-sm font-medium mb-1">Stock</label>
        <input
          type="number"
          className="input w-full"
          value={form.stock}
          onChange={(e) =>
            setForm({ ...form, stock: Number(e.target.value) })
          }
        />
      </div>

      <AdminModalFooter>
        {variant && (
          <button
            onClick={deleteVariant}
            disabled={isPending}
            className="btn btn-danger"
          >
            {isPending ? "Deleting…" : "Delete"}
          </button>
        )}

        <button
          onClick={save}
          disabled={isPending}
          className="btn btn-primary"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </AdminModalFooter>
    </div>
  );
}
