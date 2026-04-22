"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import admin from "@/lib/admin/client";
import { toast } from "../ui/toast/AdminToastProvider";
import type { AdminProductSummary } from "@/lib/products/types";

export default function ProductRow({ product }: { product: AdminProductSummary }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggleArchive() {
    startTransition(async () => {
      try {
        await admin.products.update(product.id, {
          isArchived: !product.isArchived,
        });

        toast.success(
          product.isArchived ? "Product restored" : "Product archived"
        );

        router.refresh();
      } catch {
        toast.error("Failed to update product");
      }
    });
  }

  return (
    <tr className="border-t border-border-default">
      {/* Name */}
      <td className="p-3 font-medium">{product.name}</td>

      {/* Slug */}
      <td className="p-3 text-text-secondary">{product.slug}</td>

      {/* Price */}
      <td className="p-3">
        ₦{(product.basePrice / 100).toFixed(2)}
      </td>

      {/* Stock */}
      <td className="p-3">{product.stock}</td>

      {/* Updated */}
      <td className="p-3 text-text-secondary">
        {new Date(product.updatedAt).toLocaleDateString()}
      </td>

      {/* Actions */}
      <td className="p-3 text-right space-x-2">
        <Link
          href={`/admin/products/${product.id}`}
          className="btn btn-sm btn-outline"
        >
          Edit
        </Link>

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
