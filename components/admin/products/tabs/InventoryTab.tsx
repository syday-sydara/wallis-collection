"use client";

import admin from "@/lib/admin/client";
import { toast } from "@/components/admin/ui/toast/AdminToastProvider";
import { useTransition } from "react";

export default function InventoryTab({ product }) {
  const [isPending, startTransition] = useTransition();

  function updateStock(variantId, stock) {
    startTransition(async () => {
      try {
        await admin.products.variants.update(product.id, variantId, { stock });
        toast.success("Stock updated");
      } catch {
        toast.error("Failed to update stock");
      }
    });
  }

  return (
    <div className="space-y-4 max-w-lg">
      {product.variants.map((v) => (
        <div key={v.id} className="flex items-center justify-between border-b py-3">
          <div>
            <div className="font-medium">{v.name}</div>
            <div className="text-text-secondary text-sm">Variant ID: {v.id}</div>
          </div>

          <input
            type="number"
            defaultValue={v.stock}
            onBlur={(e) => updateStock(v.id, Number(e.target.value))}
            className="input w-24"
          />
        </div>
      ))}
    </div>
  );
}
