import Link from "next/link";
import Image from "next/image";
import { adminListProductsPaginated } from "@/lib/catalog/admin";

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams: {
    cursor?: string;
    search?: string;
    archived?: string;
    sort?: string;
    direction?: string;
  };
}) {
  const { cursor, search, archived, sort, direction } = searchParams;

  const { items, nextCursor } = await adminListProductsPaginated({
    cursor,
    search,
    archived: archived === "true" ? true : archived === "false" ? false : undefined,
    sort: (sort as any) || "createdAt",
    direction: (direction as any) || "desc"
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Products</h1>

        <Link
          href="/admin/products/new"
          className="rounded bg-black px-3 py-1.5 text-xs font-medium text-white"
        >
          New Product
        </Link>
      </div>

      {/* FILTERS */}
      <form className="flex flex-wrap gap-3 text-xs">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search products…"
          className="rounded border px-2 py-1"
        />

        <select
          name="archived"
          defaultValue={archived}
          className="rounded border px-2 py-1"
        >
          <option value="">All</option>
          <option value="false">Active</option>
          <option value="true">Archived</option>
        </select>

        <select
          name="sort"
          defaultValue={sort}
          className="rounded border px-2 py-1"
        >
          <option value="createdAt">Created</option>
          <option value="updatedAt">Updated</option>
          <option value="name">Name</option>
          <option value="basePrice">Price</option>
        </select>

        <select
          name="direction"
          defaultValue={direction}
          className="rounded border px-2 py-1"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>

        <button
          type="submit"
          className="rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white"
        >
          Apply
        </button>
      </form>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-neutral-600">
              <th className="py-2">Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-b text-xs">
                <td className="py-2">
                  {p.images.length > 0 ? (
                    <Image
                      src={p.images[0].url}
                      alt={p.images[0].alt ?? ""}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-neutral-200" />
                  )}
                </td>

                <td>{p.name}</td>
                <td>₦{(p.basePrice / 100).toLocaleString("en-NG")}</td>
                <td>{p.stock}</td>
                <td>
                  {p.isArchived ? (
                    <span className="text-red-600">Archived</span>
                  ) : (
                    <span className="text-green-600">Active</span>
                  )}
                </td>

                <td className="text-right">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-neutral-700 underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* LOAD MORE */}
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