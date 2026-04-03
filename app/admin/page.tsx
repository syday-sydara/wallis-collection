import Link from "next/link";
import { adminListProductsPaginated } from "@/lib/catalog/admin";
import { useState, useEffect } from "react";

export default function AdminProductsPage({
  searchParams
}: {
  searchParams: { cursor?: string };
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Fetch products on initial load or when the cursor changes
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const { items, nextCursor } = await adminListProductsPaginated({
          cursor: searchParams.cursor
        });
        setItems(items);
        setNextCursor(nextCursor);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [searchParams.cursor]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text tracking-tight">Products</h2>

        <Link
          href="/admin/products/new"
          className="rounded-md bg-primary px-4 py-2 text-xs font-medium 
                     text-primary-foreground shadow-sm hover:bg-primary-hover 
                     active:bg-primary-active transition-all"
          aria-label="Create new product"
        >
          New product
        </Link>
      </div>

      {/* Error Handling */}
      {error && (
        <div className="text-red-500 text-sm mb-4">{error}</div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface-card shadow-card">
        <table className="w-full text-left text-sm">
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
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-sm">
                  Loading products...
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="hover:bg-surface-muted/50 transition-colors">
                  {/* Name + slug */}
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="font-medium text-text hover:underline"
                      aria-label={`View details for ${p.name}`}
                    >
                      {p.name}
                    </Link>
                    <div className="text-xs text-text-muted">{p.slug}</div>
                  </td>

                  {/* Price */}
                  <td className="px-4">
                    {p.basePrice != null ? (
                      <>₦{(p.basePrice / 100).toLocaleString("en-NG")}</>
                    ) : (
                      <span className="text-xs text-text-muted">—</span>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="px-4">
                    {typeof p.stock === "number" ? p.stock : "—"}
                  </td>

                  {/* Status */}
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

                  {/* Updated */}
                  <td className="px-4 text-xs text-text-muted">
                    {new Date(p.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {nextCursor && (
        <div className="pt-4">
          <Link
            href={`/admin/products?cursor=${nextCursor}`}
            className="text-sm text-text-muted underline hover:text-text"
            aria-label="Load more products"
          >
            Load more
          </Link>
        </div>
      )}
    </div>
  );
}