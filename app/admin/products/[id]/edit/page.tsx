import { notFound } from "next/navigation";
import { adminGetProduct } from "@/lib/catalog/admin";

import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminSection } from "@/components/admin/ui/AdminSection";
import { AdminCard } from "@/components/admin/ui/AdminCard";

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
    <div className="space-y-10">
      {/* Page Header */}
      <AdminPageHeader
        title={product.name}
        subtitle={`SKU: ${product.slug}`}
        breadcrumbs={
          <span>
            <a href="/admin/products" className="hover:underline">
              Products
            </a>{" "}
            / {product.name}
          </span>
        }
      />

      <div className="grid gap-10 md:grid-cols-[2fr,1fr]">
        {/* LEFT COLUMN */}
        <div className="space-y-10">
          {/* Product Info */}
          <AdminSection title="Product">
            <AdminCard>
              <ProductForm product={product} />
            </AdminCard>
          </AdminSection>

          {/* Variants */}
          <AdminSection title="Variants">
            <AdminCard header="Existing Variants">
              <VariantList variants={product.variants} />
            </AdminCard>

            <AdminCard header="Add Variant">
              <VariantForm productId={product.id} />
            </AdminCard>
          </AdminSection>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-10">
          {/* Images */}
          <AdminSection title="Images">
            <AdminCard>
              <ImagesManager
                productId={product.id}
                images={product.images.map((i) => ({
                  id: i.id,
                  url: i.url,
                  alt: i.alt
                }))}
              />
            </AdminCard>
          </AdminSection>

          {/* Inventory */}
          <AdminSection title="Inventory">
            <AdminCard>
              <InventorySection productId={product.id} stock={product.stock} />
            </AdminCard>
          </AdminSection>

          {/* Movements */}
          <AdminSection title="Recent Movements">
            <AdminCard>
              <RecentMovements movements={product.inventory} />
            </AdminCard>
          </AdminSection>
        </div>
      </div>
    </div>
  );
}