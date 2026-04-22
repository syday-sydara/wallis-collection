import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ImageManager } from "../_components/ImageManager";
import { ProductForm } from "../_components/ProductForm";
import { updateProductAction } from "./actions";

export default async function ProductEditorPage({ params }) {
  const product = await prisma.product.findUnique({
    where: { id: params.productId },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
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

        <ProductForm
          product={product}
          action={(formData) => updateProductAction(product.id, formData)}
        />
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
                    SKU: {variant.sku} • ${variant.price} • Stock: {variant.stock}
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
