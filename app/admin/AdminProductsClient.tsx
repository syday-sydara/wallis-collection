"use client";

import Link from "next/link";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice?: number;
  stock?: number;
  isArchived: boolean;
  updatedAt: string;
}

interface PaginatedProducts {
  items: Product[];
  nextCursor?: string;
}

interface AdminProductsClientProps {
  initialData: PaginatedProducts;
}

export default function AdminProductsClient({ initialData }: AdminProductsClientProps) {
  const [items, setItems] = useState(initialData.items);
  const [nextCursor, setNextCursor] = useState(initialData.nextCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMore() {
    if (!nextCursor || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/products?cursor=${nextCursor}`);

      if (!res.ok) throw new Error("Request failed");

      const data: PaginatedProducts = await res.json();

      if (!data || !Array.isArray(data.items)) {
        throw new Error("Invalid response");
      }

      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text tracking-tight">Products</h2>

        <Link
          href="/admin/products/new"
          className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground
                     shadow-sm hover:bg-primary-hover active:bg-primary-active transition-all"
        >
          New product
        </Link>
      </div>

      {error && (
        <div className="text-danger text-sm mb-4 flex items-center gap-3">
          {error}
          <button
            onClick={loadMore}
            className="underline text-danger-foreground hover:text-danger"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface-card shadow-sm">
        <table className="w-full text-left text-sm" aria-busy={loading}>
          <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
            <tr>
              <th className="py-3 px-4">Name</th>
              <th className="px-4">Price</th>
              <th className="px-4">Stock</th>
              <th className="px-4">Status</th>
              <th className="px-4">Updated</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {items.map((p) => (
              <tr
                key={p.id}
                className="hover:bg-surface-muted/50 transition-colors cursor-pointer"
              >
                <td className="py-3 px-4">
                  <Link href={`/admin/products/${p.id}`} className="font-medium text-text hover:underline">
                    {p.name}
                  </Link>
                  <div className="text-xs text-text-muted">{p.slug}</div>
                </td>

                <td className="px-4">
                  {p.basePrice != null ? (
                    <>₦{(p.basePrice / 100).toLocaleString("en-NG")}</>
                  ) : (
                    <span className="text-xs text-text-muted">—</span>
                  )}
                </td>

                <td className="px-4">{p.stock ?? "—"}</td>

                <td className="px-4">
                  {p.isArchived ? (
                    <span className="rounded-md bg-danger px-2 py-0.5 text-xs text-danger-foreground">
                      Archived
                    </span>
                  ) : (
                    <span className="rounded-md bg-success px-2 py-0.5 text-xs text-success-foreground">
                      Active
                    </span>
                  )}
                </td>

                <td className="px-4 text-xs text-text-muted">
                  {new Date(p.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}

            {loading && (
              <tr>
                <td colSpan={5} className="py-3 px-4">
                  <div className="animate-shimmer bg-skeleton h-4 rounded-md w-1/3" />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {nextCursor && (
        <div className="pt-4 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="text-sm text-text-muted underline hover:text-text disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}