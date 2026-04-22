"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";

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
      if (!data || !Array.isArray(data.items)) throw new Error("Invalid response");

      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  const formatPrice = (price?: number) =>
    price != null ? `₦${(price / 100).toLocaleString("en-NG")}` : "—";

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Products</h2>

        <Link href="/admin/products/new" className="btn btn-primary">
          New Product
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="text-danger text-sm mb-4 flex items-center gap-3">
          {error}
          <button
            onClick={loadMore}
            className="underline hover:text-danger transition-fast"
          >
            Retry
          </button>
        </div>
      )}

      {/* MOBILE CARD VIEW */}
      <div className="grid gap-4 sm:hidden">
        {items.map((p) => (
          <Link
            key={p.id}
            href={`/admin/product/${p.id}`}
            className="card p-4 flex flex-col gap-2 active:scale-95 transition-fast"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{p.name}</h3>
              <StatusBadge archived={p.isArchived} />
            </div>

            <div className="text-xs text-text-muted">{p.slug}</div>

            <div className="flex justify-between text-sm mt-2">
              <span>{formatPrice(p.basePrice)}</span>
              <span>{p.stock ?? "—"} in stock</span>
            </div>

            <div className="text-xs text-text-muted mt-1">
              Updated {formatDate(p.updatedAt)}
            </div>
          </Link>
        ))}

        {loading && <SkeletonRow />}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden sm:block overflow-hidden rounded-lg border border-border bg-surface-card shadow-sm">
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
                onClick={() => (window.location.href = `/admin/product/${p.id}`)}
              >
                <td className="py-3 px-4">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-text-muted">{p.slug}</div>
                </td>

                <td className="px-4">{formatPrice(p.basePrice)}</td>

                <td className="px-4">{p.stock ?? "—"}</td>

                <td className="px-4">
                  <StatusBadge archived={p.isArchived} />
                </td>

                <td className="px-4 text-xs text-text-muted">
                  {formatDate(p.updatedAt)}
                </td>
              </tr>
            ))}

            {loading && (
              <tr>
                <td colSpan={5} className="py-3 px-4">
                  <SkeletonRow />
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
            className="text-sm text-text-muted underline hover:text-text disabled:opacity-50 transition-fast"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/* Status Badge                                        */
/* -------------------------------------------------- */

function StatusBadge({ archived }: { archived: boolean }) {
  return (
    <span
      className={clsx(
        "rounded-md px-2 py-0.5 text-xs font-medium",
        archived
          ? "bg-danger text-danger-foreground"
          : "bg-success text-success-foreground"
      )}
    >
      {archived ? "Archived" : "Active"}
    </span>
  );
}

/* -------------------------------------------------- */
/* Skeleton Loader                                     */
/* -------------------------------------------------- */

function SkeletonRow() {
  return (
    <div className="animate-shimmer bg-skeleton h-4 rounded-md w-1/3" />
  );
}
