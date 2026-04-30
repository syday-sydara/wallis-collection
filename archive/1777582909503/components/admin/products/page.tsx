import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductRow from "./_components/ProductRow";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }) {
  const page = Number(searchParams.page ?? 1);
  const q = searchParams.q?.toString() ?? "";
  const showArchived = searchParams.archived === "true";

  const PAGE_SIZE = 20;

  const where = {
    AND: [
      q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      showArchived ? { isArchived: true } : { isArchived: false },
    ],
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        stock: true,
        updatedAt: true,
        isArchived: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Products</h1>

        <Link href="/admin/products/new" className="btn btn-primary">
          + Create Product
        </Link>
      </div>

      {/* Search + Filters */}
      <form className="flex items-center gap-4">
        <input
          type="text"
          name="q"
          placeholder="Search products…"
          defaultValue={q}
          className="border rounded px-3 py-2 w-64"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="archived"
            value="true"
            defaultChecked={showArchived}
          />
          Show archived
        </label>

        <button className="btn btn-outline" type="submit">
          Apply
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg bg-white shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Slug</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Updated</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-gray-500">
          Page {page} of {totalPages} • {total} products
        </p>

        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={`/admin/products?page=${page - 1}&q=${q}&archived=${showArchived}`}
              className="btn btn-sm btn-outline"
            >
              Previous
            </Link>
          )}

          {page < totalPages && (
            <Link
              href={`/admin/products?page=${page + 1}&q=${q}&archived=${showArchived}`}
              className="btn btn-sm btn-outline"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
