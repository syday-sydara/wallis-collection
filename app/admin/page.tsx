// app/admin/products/page.tsx
import Link from "next/link";
import { adminListProductsPaginated } from "@/lib/catalog/admin";

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams: { cursor?: string };
}) {
  const { items, nextCursor } = await adminListProductsPaginated({
    cursor: searchParams.cursor
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Products</h2>
        <Link
          href="/admin/products/new"
          className="rounded bg-black px-3 py-1.5 text-xs font-medium text-white"
        >
          New product
        </Link>
      </div>

      <table className="w-full text-left text-xs">
        <thead className="border-b text-[11px] uppercase text-neutral-500">
          <tr>
            <th className="py-2">Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y text-[13px]">
          {items.map((p) => (
            <tr key={p.id}>
              <td className="py-2">
                <Link
                  href={`/admin/products/${p.id}`}
                  className="font-medium hover:underline"
                >
                  {p.name}
                </Link>
                <div className="text-[11px] text-neutral-500">{p.slug}</div>
              </td>
              <td>₦{(p.basePrice / 100).toLocaleString("en-NG")}</td>
              <td>{p.stock}</td>
              <td>{p.isArchived ? "Archived" : "Active"}</td>
              <td>
                {new Date(p.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {nextCursor && (
        <div className="mt-4">
          <Link
            href={`/admin/products?cursor=${nextCursor}`}
            className="text-xs text-neutral-700 underline"
          >
            Load more
          </Link>
        </div>
      )}
    </div>
  );
}
