import { notFound } from "next/navigation";
import { adminGetProduct } from "@/lib/catalog/admin";

import { ProductForm } from "../components/ProductForm";
import { VariantList } from "../components/VariantList";
import { VariantForm } from "../components/VariantForm";
import { ImagesManager } from "../components/ImagesManager";
import { InventorySection } from "../components/InventorySection";
import { RecentMovements } from "../components/RecentMovements";

export default async function EditProductPage({
  params
}: {
  params: { id: string };
}) {
  const product = await adminGetProduct(params.id);
  if (!product) return notFound();

  return (
    <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
      {/* Left column: product + variants */}
      <section className="space-y-8">
        {/* Product form */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-text tracking-tight">
            Product
          </h2>
          <ProductForm product={product} />
        </div>

        {/* Variants */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-text tracking-tight">
            Variants
          </h3>

          <VariantList variants={product.variants} />

          <VariantForm productId={product.id} />
        </div>
      </section>

      {/* Right column: images, inventory, movements */}
      <section className="space-y-8 text-sm">
        <ImagesManager
          productId={product.id}
          images={product.images.map((i) => ({
            id: i.id,
            url: i.url,
            alt: i.alt
          }))}
        />

        <InventorySection productId={product.id} stock={product.stock} />

        <RecentMovements movements={product.inventory} />
      </section>
    </div>
  );
}