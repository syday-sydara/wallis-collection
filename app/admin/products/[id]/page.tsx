import { notFound } from "next/navigation";
import { adminGetProduct } from "@/lib/catalog/admin";
import { ProductForm } from "./components/ProductForm";
import { VariantList } from "./components/VariantList";
import { VariantForm } from "./components/VariantForm";
import { ImagesManager } from "./components/ImagesManager";
import { InventorySection } from "./components/InventorySection";
import { RecentMovements } from "./components/RecentMovements";

export default async function EditProductPage({
  params
}: {
  params: { id: string };
}) {
  const product = await adminGetProduct(params.id);
  if (!product) return notFound();

  return (
    <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
      <section className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-base font-semibold">Product</h2>
          <ProductForm product={product} />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Variants</h3>
          <VariantList variants={product.variants} />
          <VariantForm productId={product.id} />
        </div>
      </section>

      <section className="space-y-6 text-sm">
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