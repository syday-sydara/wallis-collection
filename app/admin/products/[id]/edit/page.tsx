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
import Link from "next/link";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await adminGetProduct(params.id);
  if (!product) return notFound();

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title={product.name}
        subtitle={`SKU: ${product.slug}`}
        breadcrumbs={
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-xs text-text-muted">
              <li>
                <Link href="/admin/products" className="hover:underline">
                  Products
                </Link>
              </li>
              <li>/</li>
              <li className="text-text">{product.name}</li>
            </ol>
          </nav>
        }
      />

      <div className="grid gap-10 md:grid-cols-[2fr,1fr]">
        {/* LEFT COLUMN */}
        <div className="space-y-10">
          <AdminSection title="Product">
            <AdminCard>
              <ProductForm product={product} />
            </AdminCard>
          </AdminSection>

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

          <AdminSection title="Inventory">
            <AdminCard>
              <InventorySection productId={product.id} stock={product.stock} />
            </AdminCard>
          </AdminSection>

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