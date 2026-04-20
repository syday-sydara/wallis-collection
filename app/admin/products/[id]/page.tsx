import { prisma } from "@/lib/prisma";
import {ProductForm} from "./components/ProductForm";
import {ImagesManager} from "./components/ImagesManager";
import {VariantList} from "./components/VariantList";
import {InventorySection} from "./components/InventorySection";
import Link from "next/link";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      images: true,
      variants: true,
    },
  });

  if (!product) {
    return (
      <div className="text-danger text-sm">
        Product not found.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">
          Edit Product
        </h1>

        <Link href="/admin/products" className="btn btn-outline">
          Back
        </Link>
      </div>

      {/* MOBILE-FIRST STACKED SECTIONS */}
      <div className="flex flex-col gap-6 sm:hidden">
        {/* General */}
        <section className="card p-4">
          <h2 className="text-lg font-medium mb-3">General</h2>
          <ProductForm product={product} />
        </section>

        {/* Images */}
        <section className="card p-4">
          <h2 className="text-lg font-medium mb-3">Images</h2>
          <ImagesManager productId={product.id} images={product.images} />
        </section>

        {/* Inventory */}
        <section className="card p-4">
          <h2 className="text-lg font-medium mb-3">Inventory</h2>
          <InventorySection product={product} />
        </section>

        {/* Variants */}
        <section className="card p-4">
          <h2 className="text-lg font-medium mb-3">Variants</h2>
          <VariantList productId={product.id} variants={product.variants} />
        </section>
      </div>

      {/* DESKTOP GRID LAYOUT */}
      <div className="hidden sm:grid sm:grid-cols-3 sm:gap-6">
        {/* Left Column */}
        <div className="space-y-6 col-span-2">
          <section className="card p-6">
            <h2 className="text-lg font-medium mb-4">General</h2>
            <ProductForm product={product} />
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-medium mb-4">Images</h2>
            <ImagesManager productId={product.id} images={product.images} />
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="text-lg font-medium mb-4">Inventory</h2>
            <InventorySection product={product} />
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-medium mb-4">Variants</h2>
            <VariantList productId={product.id} variants={product.variants} />
          </section>
        </div>
      </div>
    </div>
  );
}
