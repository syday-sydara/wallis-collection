// app/admin/products/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { adminGetProductWithInventory } from "@/lib/catalog/admin";
import { updateProduct, createVariant, adjustInventory } from "../actions";
import VariantItem from "./VariantItem";
import { ImagesManager } from "./ImagesClient";

export default async function EditProductPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { invCursor?: string };
}) {
  const productWithInv = await adminGetProductWithInventory(
    params.id,
    searchParams.invCursor
  );

  if (!productWithInv) return notFound();

  const { product, movements, nextCursor } = productWithInv;

  /* -----------------------------
     SERVER ACTION WRAPPERS
  ----------------------------- */

  async function updateAction(formData: FormData) {
    "use server";
    await updateProduct(product.id, formData);
  }

  async function variantAction(formData: FormData) {
    "use server";
    await createVariant(product.id, formData);
  }

  async function inventoryAction(formData: FormData) {
    "use server";
    await adjustInventory(product.id, formData);
  }

  /* -----------------------------
     PAGE LAYOUT
  ----------------------------- */

  return (
    <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
      {/* LEFT COLUMN — PRODUCT + VARIANTS */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold">Product</h2>

        {/* PRODUCT FORM */}
        <form action={updateAction} className="space-y-3 text-sm">
          <div>
            <label className="block text-xs font-medium">Name</label>
            <input
              name="name"
              defaultValue={product.name}
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium">Slug</label>
            <input
              name="slug"
              defaultValue={product.slug}
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium">Base price (kobo)</label>
            <input
              name="basePrice"
              type="number"
              defaultValue={product.basePrice}
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium">Description</label>
            <textarea
              name="description"
              defaultValue={product.description ?? ""}
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              rows={4}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isArchived"
              name="isArchived"
              type="checkbox"
              defaultChecked={product.isArchived}
            />
            <label htmlFor="isArchived" className="text-xs">
              Archived
            </label>
          </div>

          <button
            type="submit"
            className="rounded bg-black px-3 py-1.5 text-xs font-medium text-white"
          >
            Save
          </button>
        </form>

        {/* VARIANTS */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Variants</h3>

          <ul className="space-y-2 text-xs">
            {product.variants.map((v) => (
              <VariantItem key={v.id} variant={v} />
            ))}
          </ul>

          {/* CREATE VARIANT */}
          <form
            action={variantAction}
            className="mt-2 grid grid-cols-3 gap-2 text-xs"
          >
            <input
              name="name"
              placeholder="Variant name"
              className="rounded border px-2 py-1"
              required
            />
            <input
              name="sku"
              placeholder="SKU"
              className="rounded border px-2 py-1"
              required
            />
            <input
              name="price"
              type="number"
              placeholder="Price (kobo)"
              className="rounded border px-2 py-1"
              required
            />

            <button
              type="submit"
              className="col-span-3 rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white"
            >
              Add variant
            </button>
          </form>
        </div>
      </section>

      {/* RIGHT COLUMN — INVENTORY + IMAGES */}
      <section className="space-y-6 text-sm">
        {/* INVENTORY */}
        <div>
          <h3 className="text-sm font-semibold">Inventory</h3>
          <p className="text-xs text-neutral-600">
            Current stock:{" "}
            <span className="font-semibold">{product.stock}</span>
          </p>

          <form action={inventoryAction} className="mt-2 space-y-2 text-xs">
            <div className="flex gap-2">
              <input
                name="change"
                type="number"
                placeholder="+10 / -5"
                className="w-24 rounded border px-2 py-1"
                required
              />
              <input
                name="reason"
                placeholder="Reason"
                className="flex-1 rounded border px-2 py-1"
                required
              />
            </div>

            <button
              type="submit"
              className="rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white"
            >
              Adjust stock
            </button>
          </form>

          {/* MOVEMENTS LIST */}
          <ul className="mt-4 space-y-1 text-xs text-neutral-700">
            {movements.map((m) => (
              <li key={m.id} className="flex justify-between">
                <span>
                  {m.change > 0 ? "+" : ""}
                  {m.change} · {m.reason}
                </span>
                <span className="text-[11px] text-neutral-500">
                  {new Date(m.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </li>
            ))}
          </ul>

          {/* LOAD MORE */}
          {nextCursor && (
            <Link
              href={`/admin/products/${product.id}?invCursor=${nextCursor}`}
              className="mt-2 inline-block text-[11px] text-neutral-700 underline"
            >
              Load more
            </Link>
          )}
        </div>

        {/* IMAGES MANAGER */}
        <ImagesManager
          productId={product.id}
          images={product.images.map((i) => ({
            id: i.id,
            url: i.url,
            alt: i.alt
          }))}
        />
      </section>
    </div>
  );
}