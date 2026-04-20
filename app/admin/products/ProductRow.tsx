"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateProduct } from "@/lib/products/admin";
import type { AdminProductSummary } from "@/lib/products/types";

export default function ProductRow({ product }: { product: AdminProductSummary }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggleArchive() {
    startTransition(async () => {
      await adminUpdateProduct(product.id, {
        isArchived: !product.isArchived,
      });
      router.refresh();
    });
  }

  return (
    <tr className="border-t">
      <td className="p-3">{product.name}</td>
      <td className="p-3 text-text-muted">{product.slug}</td>
      <td className="p-3">₦{(product.basePrice / 100).toFixed(2)}</td>
      <td className="p-3">{product.stock}</td>
      <td className="p-3 text-text-muted">
        {new Date(product.updatedAt).toLocaleDateString()}
      </td>

      <td className="p-3 text-right space-x-2">
        <a
          href={`/admin/products/${product.id}`}
          className="btn btn-sm btn-outline"
        >
          Edit
        </a>

        <button
          onClick={toggleArchive}
          disabled={isPending}
          className={`btn btn-sm ${
            product.isArchived ? "btn-success" : "btn-danger"
          }`}
        >
          {isPending
            ? "Saving…"
            : product.isArchived
            ? "Unarchive"
            : "Archive"}
        </button>
      </td>
    </tr>
  );
}
