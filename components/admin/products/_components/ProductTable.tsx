"use client";

import ProductRow from "../ProductRow";
import type { AdminProductSummary } from "@/lib/products/types";

export default function ProductTable({ products }: { products: AdminProductSummary[] }) {
  if (!products.length) {
    return (
      <p className="text-sm text-text-muted mt-6 text-center">
        No products found.
      </p>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left border-b">
          <tr>
            <th className="p-3 font-medium">Name</th>
            <th className="p-3 font-medium">Slug</th>
            <th className="p-3 font-medium">Price</th>
            <th className="p-3 font-medium">Stock</th>
            <th className="p-3 font-medium">Updated</th>
            <th className="p-3 font-medium text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <ProductRow key={p.id} product={p} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
