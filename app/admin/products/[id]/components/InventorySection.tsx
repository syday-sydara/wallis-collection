"use client";

import { useState } from "react";

interface InventorySectionProps {
  product: {
    id: string;
    stock: number | null;
    variants?: { id: string; name: string; stock: number }[];
  };
}

export default function InventorySection({ product }: InventorySectionProps) {
  const [stock, setStock] = useState(product.stock ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasVariants = product.variants && product.variants.length > 0;

  async function saveStock() {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/products/${product.id}/inventory`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock }),
      });

      if (!res.ok) throw new Error("Failed");
    } catch {
      setError("Failed to update stock");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Error */}
      {error && (
        <div className="text-danger text-sm bg-danger/10 p-2 rounded-md">
          {error}
        </div>
      )}

      {/* If product has variants, show a message */}
      {hasVariants && (
        <div className="text-sm text-text-muted bg-surface-muted p-3 rounded-md">
          This product uses variants. Stock is managed per variant.
        </div>
      )}

      {/* MOBILE-FIRST STOCK INPUT */}
      {!hasVariants && (
        <div className="flex flex-col gap-4 sm:hidden">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Total Stock</label>
            <input
              type="number"
              className="input"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              placeholder="0"
            />
          </div>

          <button
            onClick={saveStock}
            disabled={saving}
            className="btn btn-primary w-full disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Stock"}
          </button>
        </div>
      )}

      {/* DESKTOP TWO-COLUMN LAYOUT */}
      {!hasVariants && (
        <div className="hidden sm:grid sm:grid-cols-2 sm:gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Total Stock</label>
            <input
              type="number"
              className="input"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={saveStock}
              disabled={saving}
              className="btn btn-primary disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Stock"}
            </button>
          </div>
        </div>
      )}

      {/* VARIANT STOCK LIST (Mobile-first) */}
      {hasVariants && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Variant Stock</h3>

          {/* Mobile cards */}
          <div className="grid gap-4 sm:hidden">
            {product.variants!.map((v) => (
              <VariantStockCard key={v.id} productId={product.id} variant={v} />
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-hidden rounded-lg border border-border bg-surface-card shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
                <tr>
                  <th className="py-3 px-4">Variant</th>
                  <th className="px-4">Stock</th>
                  <th className="px-4"></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {product.variants!.map((v) => (
                  <VariantStockRow key={v.id} productId={product.id} variant={v} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------ */
/* MOBILE CARD FOR VARIANT STOCK                          */
/* ------------------------------------------------------ */

function VariantStockCard({
  productId,
  variant,
}: {
  productId: string;
  variant: { id: string; name: string; stock: number };
}) {
  const [stock, setStock] = useState(variant.stock);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);

    try {
      await fetch(`/api/admin/products/${productId}/variants/${variant.id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-4 flex flex-col gap-3 active:scale-95 transition-fast">
      <div className="font-medium">{variant.name}</div>

      <input
        type="number"
        className="input"
        value={stock}
        onChange={(e) => setStock(Number(e.target.value))}
      />

      <button
        onClick={save}
        disabled={saving}
        className="btn btn-primary w-full disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------ */
/* DESKTOP TABLE ROW FOR VARIANT STOCK                    */
/* ------------------------------------------------------ */

function VariantStockRow({
  productId,
  variant,
}: {
  productId: string;
  variant: { id: string; name: string; stock: number };
}) {
  const [stock, setStock] = useState(variant.stock);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);

    try {
      await fetch(`/api/admin/products/${productId}/variants/${variant.id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr>
      <td className="py-3 px-4">{variant.name}</td>

      <td className="px-4">
        <input
          type="number"
          className="input w-24"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
        />
      </td>

      <td className="px-4">
        <button
          onClick={save}
          disabled={saving}
          className="text-primary underline text-xs disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </td>
    </tr>
  );
}
