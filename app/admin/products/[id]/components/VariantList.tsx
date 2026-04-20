"use client";

import { useState } from "react";

interface Variant {
  id: string;
  name: string;
  price: number | null;
  stock: number;
}

interface VariantListProps {
  productId: string;
  variants: Variant[];
}

export default function VariantList({ productId, variants }: VariantListProps) {
  const [items, setItems] = useState(variants);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Variant | null>(null);

  async function deleteVariant(id: string) {
    const confirmed = confirm("Delete this variant");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/products/${productId}/variants/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed");

      setItems((prev) => prev.filter((v) => v.id !== id));
    } catch {
      alert("Failed to delete variant");
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Variant Button */}
      <button
        onClick={() => setCreating(true)}
        className="btn btn-primary w-full sm:w-auto"
      >
        Add Variant
      </button>

      {/* CREATE / EDIT FORM */}
      {(creating || editing) && (
        <VariantForm
          productId={productId}
          variant={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={(v) => {
            if (editing) {
              setItems((prev) =>
                prev.map((x) => (x.id === v.id ? v : x))
              );
            } else {
              setItems((prev) => [...prev, v]);
            }
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      {/* MOBILE CARD VIEW */}
      <div className="grid gap-4 sm:hidden">
        {items.map((v) => (
          <div
            key={v.id}
            className="card p-4 flex flex-col gap-2 active:scale-95 transition-fast"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{v.name}</h3>

              <button
                onClick={() => deleteVariant(v.id)}
                className="text-danger text-xs underline"
              >
                Delete
              </button>
            </div>

            <div className="text-sm flex justify-between">
              <span>
                {v.price != null
                  ? `₦${(v.price / 100).toLocaleString("en-NG")}`
                  : "—"}
              </span>
              <span>{v.stock} in stock</span>
            </div>

            <button
              onClick={() => setEditing(v)}
              className="btn btn-outline w-full mt-2"
            >
              Edit Variant
            </button>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden sm:block overflow-hidden rounded-lg border border-border bg-surface-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="px-4">Price</th>
              <th className="px-4">Stock</th>
              <th className="px-4"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {items.map((v) => (
              <tr key={v.id}>
                <td className="py-3 px-4">{v.name}</td>

                <td className="px-4">
                  {v.price != null
                    ? `₦${(v.price / 100).toLocaleString("en-NG")}`
                    : "—"}
                </td>

                <td className="px-4">{v.stock}</td>

                <td className="px-4 flex gap-3">
                  <button
                    onClick={() => setEditing(v)}
                    className="text-primary underline text-xs"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteVariant(v.id)}
                    className="text-danger underline text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------ */
/* VARIANT FORM (MOBILE-FIRST)                            */
/* ------------------------------------------------------ */

function VariantForm({
  productId,
  variant,
  onClose,
  onSaved,
}: {
  productId: string;
  variant: Variant | null;
  onClose: () => void;
  onSaved: (v: Variant) => void;
}) {
  const [name, setName] = useState(variant?.name || "");
  const [price, setPrice] = useState(
    variant?.price ? variant.price / 100 : ""
  );
  const [stock, setStock] = useState(variant?.stock || 0);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(
        variant
          ? `/api/admin/products/${productId}/variants/${variant.id}`
          : `/api/admin/products/${productId}/variants`,
        {
          method: variant ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            price: price ? Math.round(Number(price) * 100) : null,
            stock: Number(stock),
          }),
        }
      );

      if (!res.ok) throw new Error("Failed");

      const saved = await res.json();
      onSaved(saved);
    } catch {
      alert("Failed to save variant");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card p-4 space-y-4">
      <h3 className="text-lg font-medium">
        {variant ? "Edit Variant" : "New Variant"}
      </h3>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Name</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Variant name"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Price (₦)</label>
        <input
          type="number"
          inputMode="decimal"
          className="input"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Stock</label>
        <input
          type="number"
          className="input"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary flex-1"
        >
          {saving ? "Saving…" : "Save"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="btn btn-outline flex-1"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
