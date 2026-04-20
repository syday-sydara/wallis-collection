import { prisma } from "@/lib/prisma";
import {ProductForm} from "./components/ProductForm";
import {ImagesManager} from "./components/ImagesManager";
import {VariantList} from "./components/VariantList";
import {InventorySection} from "./components/InventorySection";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      images: true,
      variants: true,
    },
  });

  if (!product) {
    return (
      <div className="text-danger-foreground text-sm">
        Product not found.
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">
          Edit Product
        </h1>

        <a
          href="/admin/products"
          className="btn btn-outline"
        >
          Back to Products
        </a>
      </div>

      {/* GENERAL INFO */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">General</h2>
        <div className="card">
          <ProductForm product={product} />
        </div>
      </section>

      {/* IMAGES */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Images</h2>
        <div className="card">
          <ImagesManager productId={product.id} images={product.images} />
        </div>
      </section>

      {/* INVENTORY */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Inventory</h2>
        <div className="card">
          <InventorySection product={product} />
        </div>
      </section>

      {/* VARIANTS */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Variants</h2>
        <div className="card">
          <VariantList productId={product.id} variants={product.variants} />
        </div>
      </section>
    </div>
  );
}
