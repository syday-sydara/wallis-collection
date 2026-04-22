import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import {ImageManager} from "../_components/ImageManager";

export default async function ProductEditorPage({ params }) {
  const product = await prisma.product.findUnique({
    where: { id: params.productId },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
      },
      variants: true,
    },
  });

  if (!product) return notFound();

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Edit Product</h1>
        <span className="text-gray-500 text-sm">ID: {product.id}</span>
      </div>

      {/* Product Form */}
      <section className="p-6 bg-white rounded-lg shadow space-y-6">
        <h2 className="text-xl font-semibold">Product Details</h2>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Name</label>
            <input
              defaultValue={product.name}
              className="border rounded px-3 py-2"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Slug</label>
            <input
              defaultValue={product.slug}
              className="border rounded px-3 py-2"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Base Price</label>
            <input
              type="number"
              defaultValue={product.basePrice}
              className="border rounded px-3 py-2"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Stock</label>
            <input
              type="number"
              defaultValue={product.stock}
              className="border rounded px-3 py-2"
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              defaultValue={product.description ?? ""}
              rows={4}
              className="border rounded px-3 py-2"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded"
            >
              Save Changes
            </button>
          </div>
        </form>
      </section>

      {/* Images */}
      <section className="p-6 bg-white rounded-lg shadow space-y-6">
        <h2 className="text-xl font-semibold">Product Images</h2>

        <ImageManager
          productId={product.id}
          initialImages={product.images}
        />
      </section>

      {/* Variants */}
      <section className="p-6 bg-white rounded-lg shadow space-y-6">
        <h2 className="text-xl font-semibold">Variants</h2>

        {product.variants.length === 0 ? (
          <p className="text-gray-500 text-sm">No variants yet.</p>
        ) : (
          <div className="space-y-4">
            {product.variants.map((variant) => (
              <div
                key={variant.id}
                className="p-4 border rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{variant.name}</p>
                  <p className="text-sm text-gray-500">
                    SKU: {variant.sku} • ${variant.price} • Stock:{" "}
                    {variant.stock}
                  </p>
                </div>

                <button className="px-3 py-1 bg-black text-white rounded text-sm">
                  Edit
                </button>
              </div>
            ))}
          </div>
        )}

        <button className="px-4 py-2 bg-black text-white rounded">
          Add Variant
        </button>
      </section>
    </div>
  );
}
